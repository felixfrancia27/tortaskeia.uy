from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    force_password_change: bool = False
    address: Optional[str] = None
    city: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateAdmin(BaseModel):
    """Admin-only: update is_active, is_admin."""
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: int


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str
