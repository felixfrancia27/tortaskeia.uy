from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal


class CartItemProduct(BaseModel):
    id: int
    name: str
    slug: str
    price: Decimal
    main_image: Optional[str] = None

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None  # null para ítem personalizado (Crea tu torta)
    product: CartItemProduct
    quantity: int
    notes: Optional[str] = None
    subtotal: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    items: List[CartItemResponse] = []
    total: float
    item_count: int

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1
    notes: Optional[str] = None


class CartCustomItemCreate(BaseModel):
    """Torta personalizada: nombre, precio y detalles según diseño y atributos elegidos."""
    name: str
    price: float
    quantity: int = 1
    image_url: Optional[str] = None
    notes: Optional[str] = None


class CartItemUpdate(BaseModel):
    quantity: Optional[int] = None
    notes: Optional[str] = None
