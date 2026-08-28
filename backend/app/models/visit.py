"""Patient Visit Model — tracks a single hospital visit lifecycle."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db import Base


class PatientVisit(Base):
    __tablename__ = "patient_visits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    chief_complaint = Column(String(500), nullable=False)
    symptoms_description = Column(Text, nullable=True)
    status = Column(
        Enum(
            "checked_in", "in_triage", "triaged", "in_queue",
            "called", "in_consultation", "completed", "discharged",
            "cancelled", "no_show",
            name="visit_status_enum",
        ),
        default="checked_in",
        nullable=False,
        index=True,
    )
    check_in_time = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    discharge_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    queue_entry = relationship("QueueEntry", back_populates="visit", uselist=False)
    triage_assessment = relationship("TriageAssessment", back_populates="visit", uselist=False)
    consultation = relationship("Consultation", back_populates="visit", uselist=False)

    def __repr__(self):
        return f"<PatientVisit {self.id[:8]} status={self.status}>"
