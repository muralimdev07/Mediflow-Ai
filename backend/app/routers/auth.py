"""Auth Router — Google OAuth, JWT refresh, logout."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import GoogleAuthRequest, RefreshTokenRequest, TokenResponse
from app.schemas import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=TokenResponse)
async def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth authorization code."""
    service = AuthService(db)
    result = await service.google_login(request.code, request.redirect_uri)
    return result


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid refresh token."""
    service = AuthService(db)
    return service.refresh_access_token(request.refresh_token)


@router.post("/logout", response_model=MessageResponse)
def logout():
    """Logout — client should discard tokens."""
    return {"success": True, "message": "Logged out successfully"}
