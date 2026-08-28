"""
MediFlow AI — User Service

User management, profile CRUD, staff invitation.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.doctor import DoctorProfile
from app.models.invitation import Invitation
from app.models.nurse import NurseProfile
from app.models.patient import PatientProfile
from app.models.user import User


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: str) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User")
        return user

    def list_users(
        self,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[User], int]:
        query = self.db.query(User)

        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if search:
            query = query.filter(
                (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
            )

        total = query.count()
        users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return users, total

    def update_user(self, user_id: str, data: dict) -> User:
        user = self.get_user_by_id(user_id)
        for key, value in data.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_patient_profile(self, user_id: str, data: dict) -> PatientProfile:
        profile = self.db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
        if not profile:
            profile = PatientProfile(user_id=user_id)
            self.db.add(profile)

        for key, value in data.items():
            if value is not None and hasattr(profile, key):
                setattr(profile, key, value)

        self.db.commit()
        self.db.refresh(profile)
        return profile

    def invite_staff(self, email: str, role: str, invited_by_id: str) -> Invitation:
        """Invite a staff member (nurse/doctor/admin) via email."""
        if role not in ("nurse", "doctor", "admin"):
            raise ValidationError("Invalid role. Must be nurse, doctor, or admin.")

        # Check if user already exists
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise ConflictError(f"User with email {email} already exists")

        # Check for existing pending invitation
        existing_inv = self.db.query(Invitation).filter(
            Invitation.email == email,
            Invitation.status == "pending",
        ).first()
        if existing_inv:
            raise ConflictError(f"Pending invitation already exists for {email}")

        invitation = Invitation(
            email=email,
            role=role,
            invited_by=invited_by_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        self.db.add(invitation)
        self.db.commit()
        self.db.refresh(invitation)
        return invitation

    def list_invitations(self, status: Optional[str] = None) -> List[Invitation]:
        query = self.db.query(Invitation)
        if status:
            query = query.filter(Invitation.status == status)
        return query.order_by(Invitation.created_at.desc()).all()

    def admin_update_user(self, user_id: str, data: dict) -> User:
        """Admin updates user role or active status."""
        user = self.get_user_by_id(user_id)

        if "role" in data and data["role"]:
            valid_roles = ["patient", "nurse", "doctor", "admin", "super_admin"]
            if data["role"] not in valid_roles:
                raise ValidationError(f"Invalid role. Must be one of: {valid_roles}")
            user.role = data["role"]

            # Create profile if changing role
            if data["role"] == "doctor" and not user.doctor_profile:
                self.db.add(DoctorProfile(user_id=user.id))
            elif data["role"] == "nurse" and not user.nurse_profile:
                self.db.add(NurseProfile(user_id=user.id))
            elif data["role"] == "patient" and not user.patient_profile:
                self.db.add(PatientProfile(user_id=user.id))

        if "is_active" in data and data["is_active"] is not None:
            user.is_active = data["is_active"]

        self.db.commit()
        self.db.refresh(user)
        return user
