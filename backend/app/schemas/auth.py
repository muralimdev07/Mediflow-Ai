"""Auth Schemas"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class GoogleAuthRequest(BaseModel):
    """Google OAuth authorization code."""
    code: str
    redirect_uri: Optional[str] = None


class DoctorLoginRequest(BaseModel):
    """Doctor credential login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
    user: "UserBrief"


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class UserBrief(BaseModel):
    """Minimal user info returned with auth tokens."""
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


# Resolve forward reference
TokenResponse.model_rebuild()
