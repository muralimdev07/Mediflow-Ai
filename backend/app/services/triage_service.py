"""
MediFlow AI — Triage Service

AI triage assessment with XGBoost model + rule-based fallback.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.models.queue import QueueEntry
from app.models.triage import AiTriageResult, TriageAssessment
from app.models.visit import PatientVisit

settings = get_settings()

# Priority scores for each triage level
TRIAGE_PRIORITY_MAP = {
    "P1": 100,  # Resuscitation — immediate
    "P2": 85,   # Emergency — <10 min
    "P3": 60,   # Urgent — <30 min
    "P4": 40,   # Semi-urgent — <60 min
    "P5": 20,   # Non-urgent — <120 min
}


class TriageService:
    def __init__(self, db: Session):
        self.db = db

    def create_assessment(
        self,
        visit_id: str,
        assessed_by: str,
        triage_level: str,
        pain_scale: Optional[int] = None,
        vitals: Optional[dict] = None,
        nurse_notes: Optional[str] = None,
    ) -> TriageAssessment:
        """Create a nurse triage assessment and update queue priority."""
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == visit_id).first()
        if not visit:
            raise NotFoundError("Visit")

        # Create assessment
        assessment = TriageAssessment(
            visit_id=visit_id,
            assessed_by=assessed_by,
            triage_level=triage_level,
            pain_scale=pain_scale,
            vitals=vitals,
            nurse_notes=nurse_notes,
        )
        self.db.add(assessment)

        # Update visit status
        visit.status = "triaged"

        # Update queue priority
        queue_entry = self.db.query(QueueEntry).filter(QueueEntry.visit_id == visit_id).first()
        if queue_entry:
            priority_score = TRIAGE_PRIORITY_MAP.get(triage_level, 20)

            # Bonus for high pain
            if pain_scale and pain_scale >= 8:
                priority_score = min(100, priority_score + 10)

            queue_entry.triage_level = triage_level
            queue_entry.priority_score = priority_score
            queue_entry.status = "waiting"
            visit.status = "in_queue"

        self.db.commit()
        self.db.refresh(assessment)
        return assessment

    def get_ai_triage_suggestion(self, visit_id: str) -> dict:
        """Get AI triage prediction for a visit's symptoms."""
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == visit_id).first()
        if not visit:
            raise NotFoundError("Visit")

        # Try ML model first, fallback to rules
        try:
            from app.ml.triage_model import TriageModel
            model = TriageModel()
            prediction = model.predict(
                chief_complaint=visit.chief_complaint,
                symptoms_description=visit.symptoms_description or "",
            )
            return prediction
        except Exception:
            # Fallback to rule-based triage
            return self._rule_based_triage(
                visit.chief_complaint,
                visit.symptoms_description or "",
            )

    def _rule_based_triage(self, chief_complaint: str, symptoms: str) -> dict:
        """Rule-based fallback triage when ML model is unavailable."""
        text = f"{chief_complaint} {symptoms}".lower()

        # P1 — Resuscitation keywords
        p1_keywords = ["cardiac arrest", "not breathing", "unconscious", "severe bleeding",
                        "anaphylaxis", "stroke", "seizure active", "choking"]
        # P2 — Emergency keywords
        p2_keywords = ["chest pain", "difficulty breathing", "severe pain", "head injury",
                        "fracture", "high fever", "convulsion", "poisoning", "burns severe"]
        # P3 — Urgent keywords
        p3_keywords = ["moderate pain", "infection", "asthma attack", "abdominal pain",
                        "fever", "vomiting blood", "dehydration", "laceration"]
        # P4 — Semi-urgent
        p4_keywords = ["mild pain", "sprain", "rash", "earache", "sore throat",
                        "minor cut", "urinary issue", "back pain"]

        predicted_level = "P5"  # Default non-urgent
        confidence = 0.7

        for kw in p1_keywords:
            if kw in text:
                predicted_level = "P1"
                confidence = 0.85
                break

        if predicted_level == "P5":
            for kw in p2_keywords:
                if kw in text:
                    predicted_level = "P2"
                    confidence = 0.80
                    break

        if predicted_level == "P5":
            for kw in p3_keywords:
                if kw in text:
                    predicted_level = "P3"
                    confidence = 0.75
                    break

        if predicted_level == "P5":
            for kw in p4_keywords:
                if kw in text:
                    predicted_level = "P4"
                    confidence = 0.70
                    break

        level_descriptions = {
            "P1": "Resuscitation — Immediate life-threatening condition. Requires immediate intervention.",
            "P2": "Emergency — Potentially life-threatening. Needs attention within 10 minutes.",
            "P3": "Urgent — Serious but stable. Should be seen within 30 minutes.",
            "P4": "Semi-Urgent — Less urgent condition. Target wait under 60 minutes.",
            "P5": "Non-Urgent — Minor condition. Can safely wait up to 120 minutes.",
        }

        return {
            "predicted_level": predicted_level,
            "confidence_score": confidence,
            "is_confident": confidence >= settings.ML_CONFIDENCE_THRESHOLD,
            "feature_importances": [
                {"feature": "chief_complaint", "importance": 0.6, "direction": "primary"},
                {"feature": "symptoms_keywords", "importance": 0.3, "direction": "supporting"},
                {"feature": "rule_based", "importance": 0.1, "direction": "fallback"},
            ],
            "model_version": "rule_based_v1",
            "recommendation": level_descriptions.get(predicted_level, ""),
        }

    def get_assessment(self, visit_id: str) -> Optional[TriageAssessment]:
        return self.db.query(TriageAssessment).filter(
            TriageAssessment.visit_id == visit_id
        ).first()
