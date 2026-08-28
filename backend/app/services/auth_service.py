"""
MediFlow AI — Auth Service

Google OAuth flow, JWT token management, user registration.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError, AuthorizationError, ConflictError
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.models.invitation import Invitation
from app.models.patient import PatientProfile
from app.models.user import User

settings = get_settings()

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    async def google_login(self, code: str, redirect_uri: Optional[str] = None) -> dict:
        """Handle Google OAuth callback: exchange code, find/create user, issue JWT."""

        # 1. Exchange authorization code for tokens
        google_user = await self._exchange_google_code(code, redirect_uri)

        email = google_user["email"]
        google_id = google_user["id"]

        # 2. Check if user already exists
        user = self.db.query(User).filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()

        if user:
            # Update Google ID if not set (e.g., invited user logging in first time)
            if not user.google_id:
                user.google_id = google_id
                user.avatar_url = google_user.get("picture")
                self.db.commit()

            if not user.is_active:
                raise AuthorizationError("Account is deactivated. Contact admin.")

        else:
            # 3. Check for pending invitation
            invitation = self.db.query(Invitation).filter(
                Invitation.email == email,
                Invitation.status == "pending",
                Invitation.expires_at > datetime.now(timezone.utc),
            ).first()

            if invitation:
                # Staff member accepting invitation
                user = User(
                    email=email,
                    google_id=google_id,
                    full_name=google_user.get("name", email.split("@")[0]),
                    avatar_url=google_user.get("picture"),
                    role=invitation.role,
                    is_active=True,
                )
                self.db.add(user)
                invitation.status = "accepted"
                invitation.accepted_at = datetime.now(timezone.utc)
                self.db.flush()
            else:
                # New patient self-registration
                user = User(
                    email=email,
                    google_id=google_id,
                    full_name=google_user.get("name", email.split("@")[0]),
                    avatar_url=google_user.get("picture"),
                    role="patient",
                    is_active=True,
                )
                self.db.add(user)
                self.db.flush()

                # Create empty patient profile
                patient_profile = PatientProfile(user_id=user.id)
                self.db.add(patient_profile)

            self.db.commit()
            self.db.refresh(user)

        # 4. Issue JWT tokens
        access_token = create_access_token({"sub": user.id, "role": user.role})
        refresh_token = create_refresh_token({"sub": user.id, "role": user.role})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "avatar_url": user.avatar_url,
            },
        }

    def refresh_access_token(self, refresh_token: str) -> dict:
        """Issue new access token from a valid refresh token."""
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            raise AuthenticationError("Invalid or expired refresh token")

        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
        if not user:
            raise AuthenticationError("User not found")

        access_token = create_access_token({"sub": user.id, "role": user.role})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "avatar_url": user.avatar_url,
            },
        }

    async def _exchange_google_code(self, code: str, redirect_uri: Optional[str] = None) -> dict:
        """Exchange Google auth code for user info."""

        # Development mode: mock auth if no Google credentials configured
        if not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID == "your-google-client-id.apps.googleusercontent.com":
            return self._mock_google_user(code)

        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": redirect_uri or settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )

            if token_resp.status_code != 200:
                raise AuthenticationError("Failed to exchange Google authorization code")

            tokens = token_resp.json()
            access_token = tokens.get("access_token")

            # Get user info
            userinfo_resp = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if userinfo_resp.status_code != 200:
                raise AuthenticationError("Failed to fetch Google user info")

            return userinfo_resp.json()

    def _mock_google_user(self, code: str) -> dict:
        """Mock Google user for development without OAuth credentials.

        Use codes like 'patient@test.com', 'doctor@test.com', etc.
        """
        email = code if "@" in code else f"{code}@mediflow.test"
        name = email.split("@")[0].replace(".", " ").title()
        return {
            "id": f"google_mock_{email}",
            "email": email,
            "name": name,
            "picture": None,
        }
