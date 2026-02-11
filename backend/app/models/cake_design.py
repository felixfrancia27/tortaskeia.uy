from sqlalchemy import Column, Integer, String, Text, Boolean
from app.db.base import Base, TimestampMixin


class CakeDesign(Base, TimestampMixin):
    """Modelo de diseño de torta para la galería de 'Crea tu torta'."""
    __tablename__ = "cake_designs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    image_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
