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
            # Update Google ID or fresh avatar/name if provided
            updated = False
            if not user.google_id and google_id:
                user.google_id = google_id
                updated = True
            if google_user.get("picture") and user.avatar_url != google_user.get("picture"):
                user.avatar_url = google_user.get("picture")
                updated = True
            if google_user.get("name") and user.full_name != google_user.get("name") and not user.full_name:
                user.full_name = google_user.get("name")
                updated = True
            if updated:
                self.db.commit()
                self.db.refresh(user)

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

    def doctor_login(self, email: str, password: str) -> dict:
        """Authenticate doctor using email and password strictly."""
        from app.core.security import verify_password

        user = self.db.query(User).filter(
            User.email == email.strip().lower(),
            User.role == "doctor",
        ).first()

        if not user:
            raise AuthenticationError("Invalid doctor email or password")

        if not user.is_active:
            raise AuthorizationError("Doctor account is deactivated. Contact hospital administration.")

        # Check password hash
        if not user.password_hash or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid doctor email or password")

        # Create JWT tokens specifically with role=doctor
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

    def nurse_login(self, email: str, password: str) -> dict:
        """Authenticate nursing staff using email and password strictly."""
        from app.core.security import verify_password

        user = self.db.query(User).filter(
            User.email == email.strip().lower(),
            User.role == "nurse",
        ).first()

        if not user:
            raise AuthenticationError("Invalid nurse email or password")

        if not user.is_active:
            raise AuthorizationError("Nurse account is deactivated. Contact hospital administration.")

        # Check password hash
        if not user.password_hash or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid nurse email or password")

        # Create JWT tokens specifically with role=nurse
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

        # Development mode: mock auth if code is email or no Google credentials configured
        if "@" in code or not settings.GOOGLE_CLIENT_ID or settings.GOOGLE_CLIENT_ID.startswith("dummy"):
            return self._mock_google_user(code)

        async with httpx.AsyncClient() as client:
            # Exchange code for tokens
            # @react-oauth/google popup auth-code flow uses "postmessage" as redirect_uri
            effective_redirect_uri = redirect_uri or settings.GOOGLE_REDIRECT_URI
            if not effective_redirect_uri or effective_redirect_uri == "http://localhost:5173/auth/callback":
                effective_redirect_uri = "postmessage"

            token_resp = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": effective_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )

            if token_resp.status_code != 200:
                # Fallback to direct mock if code was an email
                if "@" in code:
                    return self._mock_google_user(code)
                error_detail = token_resp.text
                print(f"[Auth] Google token exchange error: {error_detail}")
                raise AuthenticationError(f"Failed to exchange Google authorization code: {token_resp.status_code}")

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
