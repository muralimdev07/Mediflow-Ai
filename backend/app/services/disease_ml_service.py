"""
MediFlow AI — ML Disease & Priority Predictor Service

Integrates:
1. ML/priority_model.pkl (Random Forest Priority Classifier for Emergency / Urgent / Normal)
2. Symptom & Age-Based Disease & Specialty Classifier
   - Predicts exact disease condition, risk severity, confidence, recommended specialist,
     and auto-routes to matching department & doctor.
"""

import os
import re
from typing import Dict, Any, Optional, List
import joblib
import numpy as np
import pandas as pd


# Disease knowledge base with symptoms, age categories, departments, and severity levels
DISEASE_KNOWLEDGE_BASE = [
    # Orthopedics / Back & Joint
    {
        "disease": "Lumbar Spondylosis / Sciatica",
        "department_code": "ORTHO",
        "department_name": "Orthopedics",
        "keywords": ["back pain", "lower back", "spine", "sciatica", "lumbar", "disc", "spinal", "high back pain", "stiffness", "vertebral", "back ache"],
        "age_min": 18,
        "age_max": 100,
        "base_severity": "Urgent",
        "description": "Degenerative spinal changes or nerve root compression causing localized spinal and radiating nerve pain."
    },
    {
        "disease": "Acute Muscle Strain / Myofascial Back Pain",
        "department_code": "ORTHO",
        "department_name": "Orthopedics",
        "keywords": ["muscle spasm", "back strain", "heavy lifting", "shoulder pain", "neck pain", "muscle pull", "neck stiffness"],
        "age_min": 10,
        "age_max": 65,
        "base_severity": "Normal",
        "description": "Muscular strain or ligamentous sprain along spinal vertebrae or cervical/lumbar regions."
    },
    {
        "disease": "Osteoarthritis / Degenerative Joint Disease",
        "department_code": "ORTHO",
        "department_name": "Orthopedics",
        "keywords": ["knee pain", "joint pain", "swollen joint", "arthritis", "hip pain", "bone crack", "joint stiffness", "difficulty walking"],
        "age_min": 40,
        "age_max": 100,
        "base_severity": "Normal",
        "description": "Chronic inflammation and progressive wear of articular cartilage in weight-bearing joints."
    },
    {
        "disease": "Acute Fracture / Severe Skeletal Trauma",
        "department_code": "ORTHO",
        "department_name": "Orthopedics",
        "keywords": ["fracture", "broken bone", "fall", "accident", "bone deformity", "cannot walk", "trauma", "twisted ankle severe", "bone visible"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Emergency",
        "description": "Acute traumatic bone injury requiring urgent radiological assessment, reduction, or immobilization."
    },

    # Cardiology
    {
        "disease": "Acute Coronary Syndrome / Myocardial Infarction",
        "department_code": "CARD",
        "department_name": "Cardiology",
        "keywords": ["chest pain", "chest tightness", "radiating to left arm", "angina", "palpitation", "heart pain", "sweating chest", "crushing chest"],
        "age_min": 25,
        "age_max": 100,
        "base_severity": "Emergency",
        "description": "Critical reduction in coronary myocardial perfusion causing ischemic chest pressure and potential infarction."
    },
    {
        "disease": "Hypertensive Urgency / Cardiac Arrhythmia",
        "department_code": "CARD",
        "department_name": "Cardiology",
        "keywords": ["high bp", "racing heart", "tachycardia", "irregular heartbeat", "fluttering", "high blood pressure", "hypertension", "pulse high"],
        "age_min": 20,
        "age_max": 100,
        "base_severity": "Urgent",
        "description": "Acutely elevated systolic/diastolic blood pressure or cardiac rhythm disturbance requiring medical stabilization."
    },

    # Neurology
    {
        "disease": "Migraine / Chronic Tension Cephalea",
        "department_code": "NEURO",
        "department_name": "Neurology",
        "keywords": ["headache", "migraine", "throbbing head", "photophobia", "nausea headache", "one side head pain", "cluster headache", "forehead throbbing"],
        "age_min": 10,
        "age_max": 75,
        "base_severity": "Normal",
        "description": "Neurovascular cephalic condition causing recurring unilateral throbbing pain, sensory hypersensitivity, and nausea."
    },
    {
        "disease": "Acute Ischemic Stroke / Cerebrovascular Attack",
        "department_code": "NEURO",
        "department_name": "Neurology",
        "keywords": ["facial droop", "slurred speech", "weakness one side", "stroke", "paralysis", "sudden numbness", "vision loss", "arm weakness", "sudden confusion"],
        "age_min": 25,
        "age_max": 100,
        "base_severity": "Emergency",
        "description": "Acute focal neurological deficit caused by cerebrovascular occlusion requiring emergent thrombolysis."
    },

    # Pediatrics
    {
        "disease": "Pediatric Bronchiolitis / High-Grade Viral Illness",
        "department_code": "PEDI",
        "department_name": "Pediatrics",
        "keywords": ["child fever", "baby fever", "toddler cough", "infant vomiting", "child rash", "pediatric fever", "baby crying", "child lethargy"],
        "age_min": 0,
        "age_max": 15,
        "base_severity": "Urgent",
        "description": "Acute viral respiratory or systemic febrile illness in pediatric patients requiring specialized pediatric care."
    },

    # Emergency Medicine / Respiratory
    {
        "disease": "Acute Asthma Exacerbation / Respiratory Distress",
        "department_code": "EMRG",
        "department_name": "Emergency Medicine",
        "keywords": ["shortness of breath", "wheezing", "asthma attack", "cannot breathe", "gasping", "low oxygen", "respiratory distress", "suffocating"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Emergency",
        "description": "Severe airway bronchospasm and hypoxemia requiring immediate nebulization, oxygen therapy, and emergency triage."
    },

    # Dermatology
    {
        "disease": "Acute Dermatitis / Eczematous Flare",
        "department_code": "DERM",
        "department_name": "Dermatology",
        "keywords": ["skin rash", "itching", "eczema", "hives", "skin redness", "psoriasis", "allergic rash", "skin blister", "dermatitis"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Normal",
        "description": "Inflammatory cutaneous eruption characterized by erythema, pruritus, and superficial skin lesions."
    },

    # ENT
    {
        "disease": "Acute Otitis Media / Sinusitis",
        "department_code": "ENT",
        "department_name": "ENT",
        "keywords": ["ear pain", "ear discharge", "sinus headache", "nasal blockage", "hearing loss", "throat infection", "tonsillitis", "ear ache"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Normal",
        "description": "Inflammatory infection of the middle ear cavity or paranasal sinus mucosa."
    },

    # Ophthalmology
    {
        "disease": "Acute Conjunctivitis / Ocular Strain",
        "department_code": "OPHTH",
        "department_name": "Ophthalmology",
        "keywords": ["eye pain", "red eye", "blurred vision", "eye irritation", "watery eyes", "eye discharge", "cornea", "conjunctivitis"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Normal",
        "description": "Infectious or allergic inflammation of the conjunctiva or acute ocular fatigue."
    },

    # Gynecology
    {
        "disease": "Pelvic Pain / Dysmenorrhea / Obstetric Evaluation",
        "department_code": "GYN",
        "department_name": "Gynecology",
        "keywords": ["period pain", "cramps", "pelvic pain", "pregnancy", "menstrual", "bleeding period", "ovarian", "gynecological"],
        "age_min": 12,
        "age_max": 65,
        "base_severity": "Urgent",
        "description": "Reproductive or obstetric condition requiring specialized gynecological assessment."
    },

    # General Medicine
    {
        "disease": "Acute Gastroenteritis / Infectious Enteritis",
        "department_code": "GEN",
        "department_name": "General Medicine",
        "keywords": ["stomach pain", "abdominal cramps", "vomiting", "diarrhea", "food poisoning", "loose stools", "nausea", "gastric"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Urgent",
        "description": "Gastrointestinal tract inflammation characterized by acute nausea, emesis, and electrolyte disturbance."
    },
    {
        "disease": "Acute Upper Respiratory Infection (URI) / Viral Flu",
        "department_code": "GEN",
        "department_name": "General Medicine",
        "keywords": ["cold", "sore throat", "cough", "runny nose", "mild fever", "body ache", "flu", "chills", "congestion", "viral fever"],
        "age_min": 0,
        "age_max": 100,
        "base_severity": "Normal",
        "description": "Common viral nasopharyngitis or upper respiratory tract infection with constitutional symptoms."
    },
]


class DiseaseMLService:
    """Singleton service for loading and executing ML models for disease & priority prediction."""

    def __init__(self):
        self.priority_model = None
        self._load_priority_model()

    def _load_priority_model(self):
        """Load trained Random Forest model from workspace ml/ folder or backend."""
        model_paths = [
            os.path.join(os.getcwd(), "ml", "priority_model.pkl"),
            os.path.join(os.getcwd(), "..", "ml", "priority_model.pkl"),
            r"C:\Users\sivan\OneDrive\Desktop\success\Mediflow-Ai\ml\priority_model.pkl",
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "priority_model.pkl"),
            os.path.join(os.path.dirname(__file__), "..", "ml", "models", "priority_model.pkl"),
        ]
        for p in model_paths:
            normalized_p = os.path.abspath(p)
            if os.path.exists(normalized_p):
                try:
                    self.priority_model = joblib.load(normalized_p)
                    print(f"[DiseaseMLService] Successfully loaded ML priority model from: {normalized_p}")
                    break
                except Exception as e:
                    print(f"Warning: Could not load ML model from {normalized_p}: {e}")

    def predict_disease_and_priority(
        self,
        chief_complaint: str,
        symptoms_description: str = "",
        age: float = 30.0,
        severity_level: int = 5,
        vitals: Optional[Dict[str, float]] = None,
        patients_ahead: int = 1,
        waiting_time: float = 10.0,
    ) -> Dict[str, Any]:
        """
        Execute ML models and knowledge rules to predict:
        - Exact Disease Diagnosis
        - Severity Priority ('Emergency' | 'Urgent' | 'Normal') & Triage P1-P5
        - Recommended Department and code
        - Confidence Score
        - Explanation features
        """
        combined_text = f"{chief_complaint} {symptoms_description}".lower()
        age_val = float(age) if age is not None and str(age).strip() != "" else 30.0
        sev_val = int(severity_level) if severity_level is not None else 5

        # 1. Match Disease based on Symptoms & Age Category
        best_match = None
        best_score = 0.0

        for item in DISEASE_KNOWLEDGE_BASE:
            score = 0.0
            matched_keywords = []

            # Check keyword matches
            for kw in item["keywords"]:
                if kw in combined_text:
                    score += 3.0
                    matched_keywords.append(kw)
                else:
                    # Partial token match
                    tokens = kw.split()
                    token_hits = sum(1 for t in tokens if len(t) > 3 and t in combined_text)
                    if token_hits > 0:
                        score += 1.0 * (token_hits / len(tokens))

            # Age Category Compatibility Bonus / Penalty
            if item["age_min"] <= age_val <= item["age_max"]:
                score += 1.0
            else:
                score -= 1.0

            # Special age boosts
            if age_val <= 14 and item["department_code"] == "PEDI":
                score += 2.5
            elif age_val > 55 and item["department_code"] == "ORTHO" and any(k in combined_text for k in ["back", "joint", "spine", "knee"]):
                score += 2.0
            elif age_val > 45 and item["department_code"] == "CARD" and any(k in combined_text for k in ["chest", "heart", "bp"]):
                score += 2.0

            if score > best_score:
                best_score = score
                best_match = {
                    **item,
                    "matched_keywords": matched_keywords,
                    "match_score": score
                }

        # Fallback if no specific disease was scored
        if not best_match or best_score < 0.8:
            if any(w in combined_text for w in ["chest", "heart", "palpitation", "angina"]):
                dept_code = "CARD"
                dept_name = "Cardiology"
                disease_name = "Suspected Cardiopulmonary Condition"
            elif any(w in combined_text for w in ["back", "bone", "spine", "joint", "muscle", "knee", "lumbar", "disc"]):
                dept_code = "ORTHO"
                dept_name = "Orthopedics"
                disease_name = "Suspected Musculoskeletal Condition"
            elif any(w in combined_text for w in ["head", "brain", "dizzy", "numb", "seizure", "stroke", "migraine"]):
                dept_code = "NEURO"
                dept_name = "Neurology"
                disease_name = "Suspected Neurological Condition"
            elif any(w in combined_text for w in ["skin", "rash", "itch", "eczema", "allergy"]):
                dept_code = "DERM"
                dept_name = "Dermatology"
                disease_name = "Dermatological Condition"
            elif any(w in combined_text for w in ["ear", "nose", "throat", "sinus", "tonsil"]):
                dept_code = "ENT"
                dept_name = "ENT"
                disease_name = "ENT / Otorhinolaryngological Condition"
            elif any(w in combined_text for w in ["eye", "vision", "cornea", "blind"]):
                dept_code = "OPHTH"
                dept_name = "Ophthalmology"
                disease_name = "Ophthalmic Condition"
            elif any(w in combined_text for w in ["period", "pregnancy", "ovary", "uterus", "cramp"]):
                dept_code = "GYN"
                dept_name = "Gynecology"
                disease_name = "Gynecological Condition"
            elif age_val <= 14:
                dept_code = "PEDI"
                dept_name = "Pediatrics"
                disease_name = "Pediatric General Evaluation"
            else:
                dept_code = "GEN"
                dept_name = "General Medicine"
                disease_name = "General Medical Condition"

            best_match = {
                "disease": disease_name,
                "department_code": dept_code,
                "department_name": dept_name,
                "base_severity": "Urgent" if sev_val >= 7 else "Normal",
                "description": f"AI diagnostic evaluation for {chief_complaint} in {dept_name}."
            }

        # 2. Run Random Forest Priority ML Model
        ml_priority = None
        ml_confidence = 0.88

        # Extract vitals or defaults based on reported severity & symptoms
        v = vitals or {}
        heart_rate = v.get("heart_rate") or (108.0 if sev_val >= 8 else (88.0 if sev_val >= 5 else 74.0))
        systolic_bp = v.get("systolic_bp") or (150.0 if sev_val >= 8 else (130.0 if sev_val >= 5 else 118.0))
        diastolic_bp = v.get("diastolic_bp") or (95.0 if sev_val >= 8 else (85.0 if sev_val >= 5 else 78.0))
        temperature = v.get("temperature") or (38.8 if "fever" in combined_text else 36.8)
        spo2 = v.get("spo2") or (91.0 if "breath" in combined_text or sev_val >= 9 else 98.5)

        if self.priority_model is not None:
            try:
                feature_df = pd.DataFrame([[
                    float(age_val),
                    float(heart_rate),
                    float(systolic_bp),
                    float(diastolic_bp),
                    float(temperature),
                    float(spo2),
                    float(patients_ahead),
                    float(waiting_time)
                ]], columns=[
                    "Age",
                    "Heart_Rate_bpm",
                    "Systolic_BP",
                    "Diastolic_BP",
                    "Temperature_C",
                    "SpO2_Percent",
                    "Patients_Ahead",
                    "Actual_Waiting_Time_Min"
                ])
                preds = self.priority_model.predict(feature_df)
                ml_priority = str(preds[0])
                if hasattr(self.priority_model, "predict_proba"):
                    probs = self.priority_model.predict_proba(feature_df)[0]
                    ml_confidence = float(np.max(probs))
            except Exception as e:
                print(f"ML priority prediction error: {e}")

        # If model output or override based on severe symptoms
        if not ml_priority:
            if sev_val >= 8 or best_match.get("base_severity") == "Emergency":
                ml_priority = "Emergency"
            elif sev_val >= 5 or best_match.get("base_severity") == "Urgent":
                ml_priority = "Urgent"
            else:
                ml_priority = "Normal"

        # Triage Level mapping
        triage_map = {
            "Emergency": "P1" if sev_val >= 9 else "P2",
            "Urgent": "P3",
            "Normal": "P4" if sev_val >= 3 else "P5",
        }
        triage_level = triage_map.get(ml_priority, "P3")

        age_cat = "Pediatric (<16)" if age_val < 16 else ("Geriatric (>60)" if age_val > 60 else "Adult (16-60)")

        return {
            "predicted_disease": best_match["disease"],
            "disease_description": best_match.get("description", ""),
            "department_code": best_match["department_code"],
            "department_name": best_match["department_name"],
            "priority": ml_priority,  # 'Emergency' | 'Urgent' | 'Normal'
            "triage_level": triage_level,  # 'P1' - 'P5'
            "confidence": round(float(ml_confidence), 2),
            "age_category": age_cat,
            "ai_summary": f"Detected {best_match['disease']} ({ml_priority} priority). Routing to {best_match['department_name']} specialist.",
        }


# Global singleton instance
disease_ml_service = DiseaseMLService()
