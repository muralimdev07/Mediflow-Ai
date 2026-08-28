"""Triage Schemas"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TriageCreateRequest(BaseModel):
    """Nurse triage assessment submission."""
    triage_level: str = Field(..., pattern="^P[1-5]$")
    pain_scale: Optional[int] = Field(None, ge=0, le=10)
    vitals: Optional[Dict[str, Any]] = None
    nurse_notes: Optional[str] = None


class TriageAssessmentRead(BaseModel):
    id: str
    visit_id: str
    assessed_by: str
    assessed_by_name: Optional[str] = None
    triage_level: str
    pain_scale: Optional[int] = None
    vitals: Optional[Dict[str, Any]] = None
    nurse_notes: Optional[str] = None
    is_ai_overridden: int = 0
    assessed_at: datetime

    class Config:
        from_attributes = True


class AiTriageResponse(BaseModel):
    """AI triage prediction with explainability."""
    predicted_level: str
    confidence_score: float
    is_confident: bool  # Above threshold
    feature_importances: List[Dict[str, Any]]  # [{feature, importance, direction}]
    model_version: str
    recommendation: str  # Human-readable recommendation
