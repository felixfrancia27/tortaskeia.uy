from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class ProductImageResponse(BaseModel):
    id: int
    url: str
    alt_text: Optional[str] = None
    is_main: bool
    sort_order: int

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Decimal
    compare_price: Optional[Decimal] = None
    sku: Optional[str] = None
    stock: int = 0
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    slug: Optional[str] = None
    images: Optional[List[str]] = None  # List of image URLs


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[Decimal] = None
    compare_price: Optional[Decimal] = None
    sku: Optional[str] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    slug: str
    images: List[ProductImageResponse] = []
    main_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
