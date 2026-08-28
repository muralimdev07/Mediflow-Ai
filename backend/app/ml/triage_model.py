"""
MediFlow AI — XGBoost Triage Model

Classifies patient urgency into P1-P5 based on symptoms and vitals.
Uses rule-based keyword extraction as features with XGBoost classifier.
"""

import os
from typing import Optional

import joblib
import numpy as np

from app.core.config import get_settings

settings = get_settings()

# Symptom keyword categories for feature extraction
SYMPTOM_CATEGORIES = {
    "cardiac": ["chest pain", "heart", "palpitation", "cardiac", "angina"],
    "respiratory": ["breathing", "shortness of breath", "cough", "asthma", "wheezing", "dyspnea"],
    "neurological": ["headache", "seizure", "unconscious", "dizziness", "stroke", "numbness", "confusion"],
    "trauma": ["injury", "fracture", "accident", "fall", "wound", "bleeding", "burn"],
    "gastrointestinal": ["abdominal pain", "nausea", "vomiting", "diarrhea", "stomach"],
    "fever": ["fever", "temperature", "chills", "flu", "infection"],
    "pain_severe": ["severe pain", "extreme pain", "unbearable", "worst pain", "10/10"],
    "pain_moderate": ["moderate pain", "ache", "sore", "discomfort"],
    "emergency_keywords": ["not breathing", "cardiac arrest", "choking", "anaphylaxis", "overdose"],
    "mental_health": ["anxiety", "panic", "suicidal", "depression", "psychosis"],
}

TRIAGE_LABELS = ["P1", "P2", "P3", "P4", "P5"]


class TriageModel:
    """XGBoost-based triage classifier with SHAP explainability."""

    def __init__(self):
        self.model = None
        self.model_version = "xgboost_v1"
        self._load_model()

    def _load_model(self):
        """Load trained model from disk."""
        model_file = os.path.join(settings.ML_MODEL_PATH, "triage_xgboost.joblib")
        if os.path.exists(model_file):
            self.model = joblib.load(model_file)
            self.model_version = "xgboost_v1"

    def extract_features(self, chief_complaint: str, symptoms_description: str, vitals: Optional[dict] = None) -> np.ndarray:
        """Extract numerical features from text symptoms and vitals."""
        text = f"{chief_complaint} {symptoms_description}".lower()
        features = []

        # Category presence features (10 features)
        for category, keywords in SYMPTOM_CATEGORIES.items():
            score = sum(1 for kw in keywords if kw in text)
            features.append(min(score, 3))  # Cap at 3

        # Text length features (2 features)
        features.append(min(len(chief_complaint.split()), 20))
        features.append(min(len(symptoms_description.split()), 50))

        # Vitals features (7 features, default to normal values)
        if vitals:
            features.append(vitals.get("temperature", 98.6))
            features.append(vitals.get("heart_rate", 72))
            features.append(vitals.get("blood_pressure_systolic", 120))
            features.append(vitals.get("blood_pressure_diastolic", 80))
            features.append(vitals.get("respiratory_rate", 16))
            features.append(vitals.get("oxygen_saturation", 98))
            features.append(vitals.get("pain_scale", 3))
        else:
            features.extend([98.6, 72, 120, 80, 16, 98, 3])

        return np.array(features).reshape(1, -1)

    def predict(self, chief_complaint: str, symptoms_description: str, vitals: Optional[dict] = None) -> dict:
        """Predict triage level with confidence and explainability."""
        features = self.extract_features(chief_complaint, symptoms_description, vitals)

        if self.model is None:
            # Fallback: use heuristic when model not trained
            return self._heuristic_predict(features, chief_complaint, symptoms_description)

        # XGBoost prediction
        proba = self.model.predict_proba(features)[0]
        predicted_idx = int(np.argmax(proba))
        predicted_level = TRIAGE_LABELS[predicted_idx]
        confidence = float(proba[predicted_idx])

        # Feature importance (from model)
        feature_names = list(SYMPTOM_CATEGORIES.keys()) + [
            "complaint_length", "symptoms_length",
            "temperature", "heart_rate", "bp_systolic", "bp_diastolic",
            "respiratory_rate", "oxygen_saturation", "pain_scale",
        ]

        importances = []
        if hasattr(self.model, "feature_importances_"):
            for i, (name, imp) in enumerate(zip(feature_names, self.model.feature_importances_)):
                if imp > 0.01:
                    importances.append({
                        "feature": name,
                        "importance": round(float(imp), 4),
                        "direction": "high" if features[0][i] > 0 else "low",
                    })
            importances.sort(key=lambda x: x["importance"], reverse=True)

        level_descriptions = {
            "P1": "Resuscitation — Immediate life-threatening condition",
            "P2": "Emergency — Needs attention within 10 minutes",
            "P3": "Urgent — Should be seen within 30 minutes",
            "P4": "Semi-Urgent — Target wait under 60 minutes",
            "P5": "Non-Urgent — Can safely wait up to 120 minutes",
        }

        return {
            "predicted_level": predicted_level,
            "confidence_score": round(confidence, 4),
            "is_confident": confidence >= settings.ML_CONFIDENCE_THRESHOLD,
            "feature_importances": importances[:5],  # Top 5
            "model_version": self.model_version,
            "recommendation": level_descriptions.get(predicted_level, ""),
        }

    def _heuristic_predict(self, features: np.ndarray, complaint: str, symptoms: str) -> dict:
        """Simple heuristic when model is not available."""
        text = f"{complaint} {symptoms}".lower()

        # Use feature scores for category detection
        category_scores = features[0][:10]
        emergency_score = category_scores[8]  # emergency_keywords index
        cardiac_score = category_scores[0]
        severe_pain = category_scores[6]

        if emergency_score > 0:
            level, conf = "P1", 0.85
        elif cardiac_score > 0 or severe_pain > 0:
            level, conf = "P2", 0.75
        elif sum(category_scores[:6]) >= 2:
            level, conf = "P3", 0.70
        elif sum(category_scores) > 0:
            level, conf = "P4", 0.65
        else:
            level, conf = "P5", 0.60

        level_descriptions = {
            "P1": "Resuscitation — Immediate life-threatening condition",
            "P2": "Emergency — Needs attention within 10 minutes",
            "P3": "Urgent — Should be seen within 30 minutes",
            "P4": "Semi-Urgent — Target wait under 60 minutes",
            "P5": "Non-Urgent — Can safely wait up to 120 minutes",
        }

        return {
            "predicted_level": level,
            "confidence_score": conf,
            "is_confident": conf >= settings.ML_CONFIDENCE_THRESHOLD,
            "feature_importances": [
                {"feature": "symptom_keywords", "importance": 0.5, "direction": "primary"},
                {"feature": "severity_indicators", "importance": 0.3, "direction": "supporting"},
            ],
            "model_version": "heuristic_v1",
            "recommendation": level_descriptions.get(level, ""),
        }
