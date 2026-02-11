from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import hmac
import hashlib
import logging

from app.db.session import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import PaymentPreferenceResponse
from app.core.config import settings
from app.api.deps import get_current_user, get_admin_user

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/preference/{order_number}", response_model=PaymentPreferenceResponse)
async def create_payment_preference(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    """Create Mercado Pago payment preference for order."""
    # Get order with items
    result = await db.execute(
        select(Order)
        .where(Order.order_number == order_number)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada",
        )
    
    if order.status not in [OrderStatus.CREADA, OrderStatus.FALLIDA]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La orden ya fue procesada",
        )
    
    # Check if MP is configured
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mercado Pago no está configurado",
        )
    
    try:
        import mercadopago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        # Build items list from order items
        items = []
        for item in order.items:
            items.append({
                "title": item.product_name,
                "quantity": item.quantity,
                "unit_price": float(item.product_price),
                "currency_id": "UYU",
            })
        
        # Add delivery fee if applicable
        if order.delivery_fee > 0:
            items.append({
                "title": "Envío",
                "quantity": 1,
                "unit_price": float(order.delivery_fee),
                "currency_id": "UYU",
            })
        
        # Backend URL for webhook (different from frontend)
        backend_url = settings.FRONTEND_URL.replace(':4000', ':8000').replace(':4200', ':8000')
        
        # Create preference
        preference_data = {
            "items": items,
            "payer": {
                "name": order.customer_name,
                "email": order.customer_email,
                "phone": {
                    "number": order.customer_phone or "",
                },
            },
            "back_urls": {
                "success": f"{settings.MERCADOPAGO_SUCCESS_URL}?order={order.order_number}",
                "failure": f"{settings.MERCADOPAGO_FAILURE_URL}?order={order.order_number}",
                "pending": f"{settings.MERCADOPAGO_PENDING_URL}?order={order.order_number}",
            },
            "auto_return": "approved",
            "external_reference": order.order_number,
            "notification_url": f"{backend_url}/api/payments/webhook",
            "statement_descriptor": "TORTASKEIA",
            "expires": True,
            "expiration_date_from": None,
            "expiration_date_to": None,
        }
        
        logger.info(f"Creating MP preference for order {order_number}")
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response.get("response", {})
        
        if not preference.get("id"):
            logger.error(f"MP preference creation failed: {preference_response}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear preferencia de pago",
            )
        
        # Update order with preference ID
        order.mp_preference_id = preference["id"]
        order.status = OrderStatus.PAGANDO
        order.payment_method = "mercadopago"
        await db.commit()
        
        logger.info(f"MP preference created: {preference['id']}")
        
        # Return sandbox or production init_point based on environment
        init_point = preference.get("sandbox_init_point") or preference.get("init_point", "")
        
        return PaymentPreferenceResponse(
            preference_id=preference["id"],
            init_point=init_point,
        )
        
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SDK de Mercado Pago no disponible",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error creating payment preference: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar pago: {str(e)}",
        )


@router.get("/status/{order_number}")
async def get_payment_status(
    order_number: str,
    db: AsyncSession = Depends(get_db),
):
    """Get current payment status for an order."""
    result = await db.execute(
        select(Order).where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada",
        )
    
    return {
        "order_number": order.order_number,
        "status": order.status.value,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
    }


def verify_webhook_signature(
    x_signature: str,
    x_request_id: str,
    data_id: str,
) -> bool:
    """Verify Mercado Pago webhook signature."""
    if not settings.MERCADOPAGO_WEBHOOK_SECRET:
        # If no secret configured, skip validation (dev mode)
        return True
    
    try:
        # Parse signature parts
        parts = dict(part.split("=") for part in x_signature.split(","))
        ts = parts.get("ts")
        v1 = parts.get("v1")
        
        if not ts or not v1:
            return False
        
        # Build manifest string
        manifest = f"id:{data_id};request-id:{x_request_id};ts:{ts};"
        
        # Calculate HMAC
        calculated_hmac = hmac.new(
            settings.MERCADOPAGO_WEBHOOK_SECRET.encode(),
            manifest.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(calculated_hmac, v1)
    except Exception as e:
        logger.error(f"Webhook signature verification error: {e}")
        return False


@router.post("/webhook")
async def mercadopago_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: str = Header(None),
    x_request_id: str = Header(None),
):
    """Handle Mercado Pago webhook notifications."""
    try:
        body = await request.json()
        logger.info(f"Webhook received: {body}")
    except Exception as e:
        logger.error(f"Failed to parse webhook body: {e}")
        return {"status": "ok"}
    
    # Get notification type and data
    topic = body.get("type") or body.get("topic")
    data = body.get("data", {})
    data_id = str(data.get("id", ""))
    
    # Verify signature if headers present
    if x_signature and x_request_id and data_id:
        if not verify_webhook_signature(x_signature, x_request_id, data_id):
            logger.warning("Invalid webhook signature")
            # Still return 200 to avoid retries, but log the issue
    
    # Process based on topic
    if topic == "payment":
        payment_id = data_id
        if payment_id:
            await process_payment_notification(db, payment_id)
    elif topic == "merchant_order":
        # Merchant orders can also contain payment info
        order_id = data_id
        if order_id:
            await process_merchant_order_notification(db, order_id)
    
    return {"status": "ok"}


async def process_payment_notification(db: AsyncSession, payment_id: str):
    """Process payment notification from Mercado Pago."""
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        logger.warning("MP access token not configured")
        return
    
    try:
        import mercadopago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        # Get payment info from MP API
        logger.info(f"Fetching payment info for: {payment_id}")
        payment_response = sdk.payment().get(payment_id)
        payment = payment_response.get("response", {})
        
        if not payment:
            logger.warning(f"Empty payment response for: {payment_id}")
            return
        
        external_reference = payment.get("external_reference")
        payment_status = payment.get("status")
        payment_status_detail = payment.get("status_detail")
        
        logger.info(f"Payment {payment_id}: status={payment_status}, ref={external_reference}")
        
        if not external_reference:
            logger.warning(f"No external_reference in payment {payment_id}")
            return
        
        # Find order by order_number (external_reference)
        result = await db.execute(
            select(Order).where(Order.order_number == external_reference)
        )
        order = result.scalar_one_or_none()
        
        if not order:
            logger.warning(f"Order not found for external_reference: {external_reference}")
            return
        
        # Update order based on payment status
        order.payment_id = str(payment_id)
        order.payment_status = payment_status
        
        # Map MP status to our order status
        if payment_status == "approved":
            order.status = OrderStatus.PAGADA
            logger.info(f"Order {external_reference} marked as PAID")
        elif payment_status in ["rejected", "cancelled", "refunded", "charged_back"]:
            order.status = OrderStatus.FALLIDA
            logger.info(f"Order {external_reference} marked as FAILED ({payment_status})")
        elif payment_status in ["pending", "in_process", "authorized"]:
            order.status = OrderStatus.PAGANDO
            logger.info(f"Order {external_reference} still pending ({payment_status})")
        
        await db.commit()
        logger.info(f"Order {external_reference} updated successfully")
        
    except Exception as e:
        logger.exception(f"Error processing payment notification: {e}")


async def process_merchant_order_notification(db: AsyncSession, order_id: str):
    """Process merchant order notification from Mercado Pago."""
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        return
    
    try:
        import mercadopago
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        # Get merchant order info
        # Note: This uses the undocumented merchant_orders endpoint
        import requests
        headers = {"Authorization": f"Bearer {settings.MERCADOPAGO_ACCESS_TOKEN}"}
        response = requests.get(
            f"https://api.mercadopago.com/merchant_orders/{order_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            return
        
        merchant_order = response.json()
        payments = merchant_order.get("payments", [])
        
        # Process each payment in the order
        for payment in payments:
            payment_id = payment.get("id")
            if payment_id:
                await process_payment_notification(db, str(payment_id))
                
    except Exception as e:
        logger.exception(f"Error processing merchant order notification: {e}")
