from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from decimal import Decimal

from app.db.base import Base, TimestampMixin


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)  # Precio en UYU
    compare_price = Column(Numeric(10, 2), nullable=True)  # Precio tachado
    sku = Column(String(50), unique=True, nullable=True)
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    # SEO
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(String(500), nullable=True)
    
    # Category
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")
    
    # Images
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    
    # Cart & Order items
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    
    @property
    def main_image(self):
        if self.images:
            main = next((img for img in self.images if img.is_main), None)
            return main.url if main else self.images[0].url
        return None


class ProductImage(Base, TimestampMixin):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(200), nullable=True)
    is_main = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    product = relationship("Product", back_populates="images")
