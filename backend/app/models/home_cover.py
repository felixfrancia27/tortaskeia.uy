from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base, TimestampMixin


class HomeCover(Base, TimestampMixin):
    """Portadas del hero de la página de inicio (carrusel)."""
    __tablename__ = "home_covers"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(200), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
