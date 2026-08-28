"""Nurse Profile Model"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db import Base


class NurseProfile(Base):
    __tablename__ = "nurse_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    badge_number = Column(String(50), nullable=True)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    shift = Column(String(20), nullable=True)  # morning, afternoon, night
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="nurse_profile")
    department = relationship("Department")

    def __repr__(self):
        return f"<NurseProfile user_id={self.user_id}>"
