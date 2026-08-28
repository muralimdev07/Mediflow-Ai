"""Users Router — profile management, admin user CRUD, staff invitations."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas import SuccessResponse, PaginatedResponse
from app.schemas.user import InviteStaffRequest, InvitationRead, UserAdminUpdate, UserRead, UserUpdate
from app.schemas.patient import PatientProfileRead, PatientProfileUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=SuccessResponse[UserRead])
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return {"success": True, "data": current_user}


@router.put("/me", response_model=SuccessResponse[UserRead])
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile."""
    service = UserService(db)
    user = service.update_user(current_user.id, data.model_dump(exclude_unset=True))
    return {"success": True, "data": user}


@router.get("/me/patient-profile", response_model=SuccessResponse[PatientProfileRead])
def get_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get patient profile for current user."""
    service = UserService(db)
    if current_user.patient_profile:
        return {"success": True, "data": current_user.patient_profile}
    profile = service.update_patient_profile(current_user.id, {})
    return {"success": True, "data": profile}


@router.put("/me/patient-profile", response_model=SuccessResponse[PatientProfileRead])
def update_patient_profile(
    data: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update patient profile."""
    service = UserService(db)
    profile = service.update_patient_profile(current_user.id, data.model_dump(exclude_unset=True))
    return {"success": True, "data": profile}


@router.get("", response_model=PaginatedResponse[UserRead])
def list_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users (admin only)."""
    service = UserService(db)
    users, total = service.list_users(role=role, is_active=is_active, search=search, page=page, page_size=page_size)
    total_pages = (total + page_size - 1) // page_size
    return {
        "success": True,
        "data": users,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.patch("/{user_id}", response_model=SuccessResponse[UserRead])
def admin_update_user(
    user_id: str,
    data: UserAdminUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin update user role or status."""
    service = UserService(db)
    user = service.admin_update_user(user_id, data.model_dump(exclude_unset=True))
    return {"success": True, "data": user}


@router.post("/invite", response_model=SuccessResponse[InvitationRead])
def invite_staff(
    data: InviteStaffRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Invite a staff member (nurse/doctor/admin) via email."""
    service = UserService(db)
    invitation = service.invite_staff(data.email, data.role, admin.id)
    return {"success": True, "data": invitation}


@router.get("/invitations", response_model=SuccessResponse[list[InvitationRead]])
def list_invitations(
    status: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all staff invitations (admin only)."""
    service = UserService(db)
    invitations = service.list_invitations(status=status)
    return {"success": True, "data": invitations}
