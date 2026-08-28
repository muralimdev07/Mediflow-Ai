"""Invitation Model — admin invites staff via email."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    role = Column(
        Enum("nurse", "doctor", "admin", name="invitation_role_enum"),
        nullable=False,
    )
    invited_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(
        Enum("pending", "accepted", "expired", "revoked", name="invitation_status_enum"),
        default="pending",
        nullable=False,
    )
    accepted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    invited_by_user = relationship("User", back_populates="invitations_sent")

    def __repr__(self):
        return f"<Invitation {self.email} role={self.role} ({self.status})>"
