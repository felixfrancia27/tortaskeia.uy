from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, date, timedelta
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderResponse
from app.api.deps import get_current_user, get_session_id

router = APIRouter()

# Capacidad máxima de tortas por día para entrega
CAPACITY_PER_DAY = 2


def generate_order_number() -> str:
    """Generate unique order number."""
    return f"TK-{uuid.uuid4().hex[:8].upper()}"


@router.get("/availability")
async def get_availability(
    from_date: date = Query(..., description="Fecha inicio YYYY-MM-DD"),
    to_date: date = Query(..., description="Fecha fin YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
):
    """
    Devuelve la disponibilidad por día en el rango dado.
    Capacidad: 2 tortas por día. reserved = suma de cantidades de órdenes
    con delivery_date en ese día (excluyendo canceladas).
    """
    if from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="from_date debe ser menor o igual a to_date",
        )
    # Limitar rango razonable (ej. 1 año)
    if (to_date - from_date).days > 365:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rango no puede superar 365 días",
        )

    # Órdenes con delivery_date en el rango, no canceladas: agrupar por fecha y sumar quantity
    stmt = (
        select(func.date(Order.delivery_date).label("d"), func.sum(OrderItem.quantity).label("total"))
        .select_from(Order)
        .join(OrderItem, Order.id == OrderItem.order_id)
        .where(Order.delivery_date.isnot(None))
        .where(Order.status != OrderStatus.CANCELADA)
        .where(Order.delivery_date >= datetime.combine(from_date, datetime.min.time()))
        .where(Order.delivery_date < datetime.combine(to_date + timedelta(days=1), datetime.min.time()))
        .group_by(func.date(Order.delivery_date))
    )
    result = await db.execute(stmt)
    rows = result.all()

    # Construir mapa fecha_str -> reserved
    reserved_by_date = {str(row.d): int(row.total or 0) for row in rows}

    # Para cada día en el rango, devolver reserved y capacity
    dates = {}
    current = from_date
    while current <= to_date:
        key = current.isoformat()
        reserved = reserved_by_date.get(key, 0)
        dates[key] = {"reserved": reserved, "capacity": CAPACITY_PER_DAY}
        current += timedelta(days=1)

    return {"dates": dates}


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Create order from cart."""
    # Get cart (con product.images para main_image en ítems de catálogo)
    load_opts = (
        selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images)
    )
    if user:
        query = select(Cart).where(Cart.user_id == user.id).options(load_opts)
    elif session_id:
        query = select(Cart).where(Cart.session_id == session_id).options(load_opts)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere autenticación o X-Session-ID",
        )
    
    result = await db.execute(query)
    cart = result.scalar_one_or_none()
    
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito está vacío",
        )

    # Validar capacidad del día de entrega (máx 2 tortas por día)
    if order_data.delivery_date:
        delivery_d = order_data.delivery_date.date() if hasattr(order_data.delivery_date, "date") else order_data.delivery_date
        total_cakes = sum(item.quantity for item in cart.items)
        stmt_reserved = (
            select(func.coalesce(func.sum(OrderItem.quantity), 0))
            .select_from(Order)
            .join(OrderItem, Order.id == OrderItem.order_id)
            .where(Order.delivery_date.isnot(None))
            .where(Order.status != OrderStatus.CANCELADA)
            .where(func.date(Order.delivery_date) == delivery_d)
        )
        res = await db.execute(stmt_reserved)
        reserved = int(res.scalar() or 0)
        if reserved + total_cakes > CAPACITY_PER_DAY:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No hay capacidad para {total_cakes} torta(s) el {delivery_d}. Quedan {CAPACITY_PER_DAY - reserved} lugar(es) ese día.",
            )
    
    # Calculate totals
    subtotal = sum(item.subtotal for item in cart.items)
    delivery_fee = 0  # TODO: Calculate based on delivery_type and location
    
    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=user.id if user else None,
        guest_email=order_data.customer_email if not user else None,
        guest_phone=order_data.customer_phone if not user else None,
        customer_name=order_data.customer_name,
        customer_email=order_data.customer_email,
        customer_phone=order_data.customer_phone,
        delivery_type=order_data.delivery_type,
        delivery_address=order_data.delivery_address,
        delivery_city=order_data.delivery_city,
        delivery_date=order_data.delivery_date,
        delivery_time_slot=order_data.delivery_time_slot,
        notes=order_data.notes,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=subtotal + delivery_fee,
        status=OrderStatus.CREADA,
    )
    db.add(order)
    await db.flush()
    
    # Create order items (desde producto catálogo o torta personalizada)
    for cart_item in cart.items:
        if cart_item.product_id and cart_item.product:
            name = cart_item.product.name
            price = cart_item.product.price
            try:
                image = cart_item.product.main_image
            except Exception:
                image = None
        else:
            name = cart_item.custom_name or "Torta personalizada"
            price = cart_item.custom_price or 0
            image = cart_item.custom_image
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            product_name=name,
            product_price=price,
            product_image=image,
            quantity=cart_item.quantity,
            subtotal=cart_item.subtotal,
            notes=cart_item.notes,
        )
        db.add(order_item)
    
    # Clear cart
    for item in cart.items:
        await db.delete(item)
    
    await db.commit()
    await db.refresh(order)
    
    # Load items for response
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    order = result.scalar_one()
    
    return order


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List user's orders."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debe iniciar sesión para ver sus órdenes",
        )
    
    query = (
        select(Order)
        .where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders


@router.get("/{order_number}", response_model=OrderResponse)
async def get_order(
    order_number: str,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
):
    """Get order by number."""
    query = (
        select(Order)
        .where(Order.order_number == order_number)
        .options(selectinload(Order.items))
    )
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orden no encontrada",
        )
    
    # Check access
    if user:
        if order.user_id != user.id and not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene acceso a esta orden",
            )
    else:
        # Guest can only access via order number (for tracking)
        pass
    
    return order
