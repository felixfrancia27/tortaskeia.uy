from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CakeDesignBase(BaseModel):
    name: str
    slug: Optional[str] = None
    image_url: str
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CakeDesignCreate(CakeDesignBase):
    pass


class CakeDesignUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CakeDesignResponse(CakeDesignBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
