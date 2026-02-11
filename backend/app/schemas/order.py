from pydantic import BaseModel, EmailStr
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

from app.models.order import OrderStatus


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    product_name: str
    product_price: Decimal
    product_image: Optional[str]
    quantity: int
    subtotal: Decimal
    notes: Optional[str]

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    # Customer info
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    
    # Delivery
    delivery_type: str  # "delivery" | "pickup"
    delivery_address: Optional[str] = None
    delivery_city: Optional[str] = None
    delivery_date: Optional[datetime] = None
    delivery_time_slot: Optional[str] = None
    
    # Notes
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_type: str
    delivery_address: Optional[str]
    delivery_city: Optional[str]
    delivery_date: Optional[datetime]
    delivery_time_slot: Optional[str]
    notes: Optional[str]
    status: OrderStatus
    subtotal: Decimal
    delivery_fee: Decimal
    discount: Decimal
    total: Decimal
    payment_method: Optional[str]
    payment_status: Optional[str]
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    internal_notes: Optional[str] = None


class PaymentPreferenceResponse(BaseModel):
    preference_id: str
    init_point: str  # URL para redirigir al checkout de MP
