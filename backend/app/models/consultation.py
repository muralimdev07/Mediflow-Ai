"""Consultation Model — doctor-patient consultation record."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visit_id = Column(String(36), ForeignKey("patient_visits.id", ondelete="CASCADE"), unique=True, nullable=False)
    doctor_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    diagnosis = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    visit = relationship("PatientVisit", back_populates="consultation")
    doctor = relationship("User", foreign_keys=[doctor_id])
    prescriptions = relationship("Prescription", back_populates="consultation", cascade="all, delete-orphan")
    vitals_records = relationship("VitalsRecord", back_populates="consultation", cascade="all, delete-orphan")
    invoice = relationship("Invoice", back_populates="consultation", uselist=False)

    def __repr__(self):
        return f"<Consultation visit={self.visit_id[:8]} doctor={self.doctor_id[:8]}>"
