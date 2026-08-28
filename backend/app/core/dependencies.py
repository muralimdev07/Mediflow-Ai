"""
MediFlow AI — Dependencies

Shared FastAPI dependencies: DB session, current user extraction, role guards.
"""

from typing import List, Optional

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import verify_token
from app.db.session import get_db
from app.models.user import User

settings = get_settings()


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("Missing or invalid authorization header")

    token = authorization.split("Bearer ")[1]
    payload = verify_token(token, token_type="access")

    if payload is None:
        raise AuthenticationError("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token payload")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise AuthenticationError("User not found or deactivated")

    return user


def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but returns None instead of raising for anonymous requests."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user(authorization=authorization, db=db)
    except AuthenticationError:
        return None


class RoleRequired:
    """Dependency class that enforces role-based access control.

    Usage:
        @router.get("/admin", dependencies=[Depends(RoleRequired(["admin", "super_admin"]))])
    """

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise AuthorizationError(
                f"Role '{current_user.role}' is not authorized for this resource"
            )
        return current_user


# Convenience role dependencies
require_patient = RoleRequired(["patient"])
require_nurse = RoleRequired(["nurse"])
require_doctor = RoleRequired(["doctor"])
require_admin = RoleRequired(["admin", "super_admin"])
require_staff = RoleRequired(["nurse", "doctor", "admin", "super_admin"])
require_clinical = RoleRequired(["nurse", "doctor"])
