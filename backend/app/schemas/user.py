"""User Schemas"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: str
    full_name: str


class UserRead(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class UserAdminUpdate(BaseModel):
    """Admin can update role and active status."""
    role: Optional[str] = None
    is_active: Optional[bool] = None


class InviteStaffRequest(BaseModel):
    email: str
    role: str  # nurse, doctor, admin
    full_name: Optional[str] = None


class InvitationRead(BaseModel):
    id: str
    email: str
    role: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True
