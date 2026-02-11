from sqlalchemy import Column, Integer, String, ForeignKey, Numeric
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class Cart(Base, TimestampMixin):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    
    # User cart (logged in)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    user = relationship("User", back_populates="cart")
    
    # Guest cart (session based)
    session_id = Column(String(100), nullable=True, index=True, unique=True)
    
    # Items
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    
    @property
    def total(self):
        return sum(item.subtotal for item in self.items) if self.items else 0
    
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items) if self.items else 0


class CartItem(Base, TimestampMixin):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # null = ítem personalizado
    
    quantity = Column(Integer, default=1)
    notes = Column(String(500), nullable=True)
    
    # Ítem creado desde "Crea tu torta" (diseño + atributos), sin producto del catálogo
    custom_name = Column(String(200), nullable=True)
    custom_price = Column(Numeric(10, 2), nullable=True)
    custom_image = Column(String(500), nullable=True)
    
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")
    
    @property
    def subtotal(self):
        if self.product_id and self.product:
            return float(self.product.price) * self.quantity
        if self.custom_price is not None:
            return float(self.custom_price) * self.quantity
        return 0.0
