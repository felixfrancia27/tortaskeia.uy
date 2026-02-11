from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HomeCoverBase(BaseModel):
    image_url: str
    alt_text: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class HomeCoverCreate(HomeCoverBase):
    pass


class HomeCoverUpdate(BaseModel):
    image_url: Optional[str] = None
    alt_text: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class HomeCoverResponse(HomeCoverBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
