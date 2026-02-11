from sqlalchemy import Column, Integer, String, Text, ForeignKey, Numeric, Enum, DateTime
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from datetime import datetime

from app.db.base import Base, TimestampMixin


class OrderStatus(PyEnum):
    CREADA = "creada"
    PAGANDO = "pagando"
    PAGADA = "pagada"
    FALLIDA = "fallida"
    EN_PREPARACION = "en_preparacion"
    LISTA = "lista"
    ENTREGADA = "entregada"
    CANCELADA = "cancelada"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # User
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="orders")
    
    # Guest info (si no está logueado)
    guest_email = Column(String(255), nullable=True)
    guest_phone = Column(String(50), nullable=True)
    
    # Customer info (copia para historial)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    
    # Delivery
    delivery_type = Column(String(20), nullable=False)  # "delivery" | "pickup"
    delivery_address = Column(String(500), nullable=True)
    delivery_city = Column(String(100), nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    delivery_time_slot = Column(String(50), nullable=True)  # "10:00-12:00"
    
    # Notes
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)  # Admin only
    
    # Status
    status = Column(Enum(OrderStatus), default=OrderStatus.CREADA, nullable=False)
    
    # Totals
    subtotal = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), default=0)
    discount = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), nullable=False)
    
    # Payment
    payment_method = Column(String(50), nullable=True)  # "mercadopago"
    payment_id = Column(String(100), nullable=True)  # MP payment ID
    payment_status = Column(String(50), nullable=True)
    mp_preference_id = Column(String(100), nullable=True)
    
    # Items
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    
    # Snapshot del producto al momento de la compra
    product_name = Column(String(200), nullable=False)
    product_price = Column(Numeric(10, 2), nullable=False)
    product_image = Column(String(500), nullable=True)
    
    quantity = Column(Integer, default=1)
    subtotal = Column(Numeric(10, 2), nullable=False)
    notes = Column(String(500), nullable=True)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
