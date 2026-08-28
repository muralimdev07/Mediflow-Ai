"""Triage Assessment and AI Triage Result Models"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship

from app.db import Base


class TriageAssessment(Base):
    __tablename__ = "triage_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visit_id = Column(String(36), ForeignKey("patient_visits.id", ondelete="CASCADE"), unique=True, nullable=False)
    assessed_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    triage_level = Column(
        Enum("P1", "P2", "P3", "P4", "P5", name="triage_level_enum"),
        nullable=False,
    )
    pain_scale = Column(Integer, nullable=True)  # 0-10
    vitals = Column(JSON, nullable=True)  # {"temperature": 98.6, "heart_rate": 72, ...}
    nurse_notes = Column(Text, nullable=True)
    is_ai_overridden = Column(Integer, default=0)  # 1 if nurse overrode AI suggestion
    assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    visit = relationship("PatientVisit", back_populates="triage_assessment")
    assessed_by_user = relationship("User", foreign_keys=[assessed_by])
    ai_result = relationship("AiTriageResult", back_populates="triage_assessment", uselist=False)

    def __repr__(self):
        return f"<TriageAssessment visit={self.visit_id[:8]} level={self.triage_level}>"


class AiTriageResult(Base):
    __tablename__ = "ai_triage_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    triage_id = Column(String(36), ForeignKey("triage_assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    predicted_level = Column(
        Enum("P1", "P2", "P3", "P4", "P5", name="triage_level_enum"),
        nullable=False,
    )
    confidence_score = Column(Float, nullable=False)
    feature_importances = Column(JSON, nullable=True)  # Top feature contributions
    shap_values = Column(JSON, nullable=True)  # SHAP explanation
    model_version = Column(String(50), nullable=False)
    predicted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    triage_assessment = relationship("TriageAssessment", back_populates="ai_result")

    def __repr__(self):
        return f"<AiTriageResult predicted={self.predicted_level} conf={self.confidence_score:.2f}>"
