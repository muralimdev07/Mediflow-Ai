"""Vitals Record Model"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class VitalsRecord(Base):
    __tablename__ = "vitals_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    consultation_id = Column(String(36), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(Float, nullable=True)  # Fahrenheit
    heart_rate = Column(Integer, nullable=True)  # BPM
    blood_pressure_systolic = Column(Integer, nullable=True)
    blood_pressure_diastolic = Column(Integer, nullable=True)
    respiratory_rate = Column(Integer, nullable=True)  # breaths/min
    oxygen_saturation = Column(Float, nullable=True)  # SpO2 %
    weight = Column(Float, nullable=True)  # kg
    height = Column(Float, nullable=True)  # cm
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    consultation = relationship("Consultation", back_populates="vitals_records")

    @property
    def blood_pressure(self) -> str:
        if self.blood_pressure_systolic and self.blood_pressure_diastolic:
            return f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic}"
        return ""

    def __repr__(self):
        return f"<VitalsRecord HR={self.heart_rate} BP={self.blood_pressure}>"
