from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, Any
import logging

from app.db.session import get_db
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemCreate, CartCustomItemCreate, CartItemUpdate
from app.api.deps import get_current_user, get_session_id

logger = logging.getLogger(__name__)
router = APIRouter()


def _cart_query_options():
    """Opciones para cargar cart con items, product e images (evita lazy load de Product.main_image)."""
    return selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images)


async def get_or_create_cart(
    db: AsyncSession,
    user: Optional[User] = None,
    session_id: Optional[str] = None,
) -> Cart:
    """Get existing cart or create new one. Siempre devuelve cart con items y product cargados."""
    if user:
        query = select(Cart).where(Cart.user_id == user.id).options(_cart_query_options())
    elif session_id:
        query = select(Cart).where(Cart.session_id == session_id).options(_cart_query_options())
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se requiere autenticación o X-Session-ID",
        )
    
    result = await db.execute(query)
    cart = result.scalar_one_or_none()
    
    if not cart:
        cart = Cart(user_id=user.id if user else None, session_id=session_id if not user else None)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
        result2 = await db.execute(
            select(Cart).where(Cart.id == cart.id).options(_cart_query_options())
        )
        cart = result2.scalar_one()
    
    return cart


def _cart_to_response(cart: Cart) -> dict[str, Any]:
    """Serializa el carrito a dict. Ítems con product_id=null son tortas personalizadas (custom_*)."""
    items_data = []
    for ci in cart.items:
        if ci.product_id and ci.product:
            product = ci.product
            try:
                price = float(product.price)
            except (TypeError, ValueError):
                price = 0.0
            subtotal = price * ci.quantity
            try:
                main_image = product.main_image if product.images else None
            except Exception:
                main_image = None
            items_data.append({
                "id": ci.id,
                "product_id": ci.product_id,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "price": price,
                    "main_image": main_image,
                },
                "quantity": ci.quantity,
                "notes": ci.notes,
                "subtotal": subtotal,
            })
        else:
            # Ítem personalizado (Crea tu torta)
            price = float(ci.custom_price or 0)
            subtotal = price * ci.quantity
            items_data.append({
                "id": ci.id,
                "product_id": None,
                "product": {
                    "id": 0,
                    "name": ci.custom_name or "Torta personalizada",
                    "slug": "torta-personalizada",
                    "price": price,
                    "main_image": ci.custom_image,
                },
                "quantity": ci.quantity,
                "notes": ci.notes,
                "subtotal": subtotal,
            })
    total = sum(it["subtotal"] for it in items_data)
    return {
        "id": cart.id,
        "items": items_data,
        "total": total,
        "item_count": sum(it["quantity"] for it in items_data),
    }


@router.get("", response_model=CartResponse)
async def get_cart(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Get current cart."""
    try:
        cart = await get_or_create_cart(db, user, session_id)
        return _cart_to_response(cart)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("get_cart error: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al obtener el carrito")


@router.post("/items", response_model=CartResponse)
async def add_to_cart(
    item: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Add item to cart."""
    product = await db.get(Product, item.product_id)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    
    cart = await get_or_create_cart(db, user, session_id)
    
    existing_item = next(
        (ci for ci in cart.items if ci.product_id == item.product_id),
        None
    )
    
    if existing_item:
        existing_item.quantity += item.quantity
        existing_item.notes = item.notes or existing_item.notes
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=item.quantity,
            notes=item.notes,
        )
        db.add(cart_item)
    
    await db.commit()
    
    result = await db.execute(
        select(Cart).where(Cart.id == cart.id).options(_cart_query_options())
    )
    cart = result.scalar_one()
    return _cart_to_response(cart)


@router.post("/items/custom", response_model=CartResponse)
async def add_custom_item_to_cart(
    item: CartCustomItemCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Agrega una torta personalizada al carrito (creada desde Crea tu torta: diseño + atributos)."""
    if item.price < 0 or item.quantity < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Precio y cantidad deben ser positivos",
        )
    cart = await get_or_create_cart(db, user, session_id)
    cart_item = CartItem(
        cart_id=cart.id,
        product_id=None,
        quantity=item.quantity,
        notes=item.notes,
        custom_name=item.name,
        custom_price=item.price,
        custom_image=item.image_url,
    )
    db.add(cart_item)
    await db.commit()
    result = await db.execute(
        select(Cart).where(Cart.id == cart.id).options(_cart_query_options())
    )
    cart = result.scalar_one()
    return _cart_to_response(cart)


@router.put("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Update cart item quantity or notes."""
    cart = await get_or_create_cart(db, user, session_id)
    
    cart_item = next((ci for ci in cart.items if ci.id == item_id), None)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito",
        )
    
    if item_update.quantity is not None:
        if item_update.quantity <= 0:
            await db.delete(cart_item)
        else:
            cart_item.quantity = item_update.quantity
    
    if item_update.notes is not None:
        cart_item.notes = item_update.notes
    
    await db.commit()
    
    result = await db.execute(
        select(Cart).where(Cart.id == cart.id).options(_cart_query_options())
    )
    cart = result.scalar_one()
    return _cart_to_response(cart)


@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_from_cart(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Remove item from cart."""
    cart = await get_or_create_cart(db, user, session_id)
    
    cart_item = next((ci for ci in cart.items if ci.id == item_id), None)
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item no encontrado en el carrito",
        )
    
    await db.delete(cart_item)
    await db.commit()
    
    result = await db.execute(
        select(Cart).where(Cart.id == cart.id).options(_cart_query_options())
    )
    cart = result.scalar_one()
    return _cart_to_response(cart)


@router.delete("", response_model=CartResponse)
async def clear_cart(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user),
    session_id: Optional[str] = Depends(get_session_id),
):
    """Clear all items from cart."""
    cart = await get_or_create_cart(db, user, session_id)
    
    for item in cart.items:
        await db.delete(item)
    
    await db.commit()
    await db.refresh(cart)
    return _cart_to_response(cart)
