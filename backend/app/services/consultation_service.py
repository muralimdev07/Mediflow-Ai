"""
MediFlow AI — Consultation Service

Doctor consultation workspace: notes, vitals, prescriptions.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.consultation import Consultation
from app.models.prescription import Prescription
from app.models.queue import QueueEntry
from app.models.visit import PatientVisit
from app.models.vitals import VitalsRecord


class ConsultationService:
    def __init__(self, db: Session):
        self.db = db

    def start_consultation(self, visit_id: str, doctor_id: str) -> Consultation:
        """Start a new consultation for a visit."""
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == visit_id).first()
        if not visit:
            raise NotFoundError("Visit")

        existing = self.db.query(Consultation).filter(Consultation.visit_id == visit_id).first()
        if existing:
            raise ValidationError("Consultation already exists for this visit")

        consultation = Consultation(
            visit_id=visit_id,
            doctor_id=doctor_id,
        )
        self.db.add(consultation)

        # Update visit and queue status
        visit.status = "in_consultation"
        queue_entry = self.db.query(QueueEntry).filter(QueueEntry.visit_id == visit_id).first()
        if queue_entry:
            queue_entry.status = "in_progress"

        self.db.commit()
        self.db.refresh(consultation)
        return consultation

    def update_consultation(self, consultation_id: str, data: dict) -> Consultation:
        """Update consultation notes, diagnosis, treatment plan."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        for key, value in data.items():
            if value is not None and hasattr(consultation, key):
                setattr(consultation, key, value)

        self.db.commit()
        self.db.refresh(consultation)
        return consultation

    def complete_consultation(self, consultation_id: str) -> Consultation:
        """Complete a consultation and update visit/queue status."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        consultation.ended_at = datetime.now(timezone.utc)

        # Update visit status
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == consultation.visit_id).first()
        if visit:
            visit.status = "completed"
            visit.discharge_time = datetime.now(timezone.utc)

        # Complete queue entry and free room
        queue_entry = self.db.query(QueueEntry).filter(QueueEntry.visit_id == consultation.visit_id).first()
        if queue_entry:
            queue_entry.status = "completed"
            queue_entry.completed_at = datetime.now(timezone.utc)

            if queue_entry.room_id:
                from app.models.room import Room
                room = self.db.query(Room).filter(Room.id == queue_entry.room_id).first()
                if room:
                    room.status = "available"

        self.db.commit()
        self.db.refresh(consultation)
        return consultation

    def add_prescription(self, consultation_id: str, data: dict) -> Prescription:
        """Add prescription to consultation."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        prescription = Prescription(
            consultation_id=consultation_id,
            **data,
        )
        self.db.add(prescription)
        self.db.commit()
        self.db.refresh(prescription)
        return prescription

    def record_vitals(self, consultation_id: str, data: dict) -> VitalsRecord:
        """Record vital signs during consultation."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        vitals = VitalsRecord(
            consultation_id=consultation_id,
            **data,
        )
        self.db.add(vitals)
        self.db.commit()
        self.db.refresh(vitals)
        return vitals

    def get_consultation(self, consultation_id: str) -> Consultation:
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")
        return consultation

    def get_doctor_consultations(self, doctor_id: str, active_only: bool = False) -> List[Consultation]:
        query = self.db.query(Consultation).filter(Consultation.doctor_id == doctor_id)
        if active_only:
            query = query.filter(Consultation.ended_at == None)  # noqa: E711
        return query.order_by(Consultation.started_at.desc()).all()

    def get_patient_history(self, patient_id: str) -> List[dict]:
        """Get patient's visit and consultation history."""
        visits = self.db.query(PatientVisit).filter(
            PatientVisit.patient_id == patient_id,
        ).order_by(PatientVisit.check_in_time.desc()).all()

        history = []
        for visit in visits:
            consultation = self.db.query(Consultation).filter(
                Consultation.visit_id == visit.id
            ).first()

            entry = {
                "visit_id": visit.id,
                "chief_complaint": visit.chief_complaint,
                "status": visit.status,
                "check_in_time": visit.check_in_time,
                "discharge_time": visit.discharge_time,
                "consultation": None,
            }

            if consultation:
                prescriptions = self.db.query(Prescription).filter(
                    Prescription.consultation_id == consultation.id
                ).all()
                vitals = self.db.query(VitalsRecord).filter(
                    VitalsRecord.consultation_id == consultation.id
                ).all()

                entry["consultation"] = {
                    "id": consultation.id,
                    "diagnosis": consultation.diagnosis,
                    "clinical_notes": consultation.clinical_notes,
                    "treatment_plan": consultation.treatment_plan,
                    "doctor_id": consultation.doctor_id,
                    "started_at": consultation.started_at,
                    "ended_at": consultation.ended_at,
                    "prescriptions": [
                        {
                            "medication_name": p.medication_name,
                            "dosage": p.dosage,
                            "frequency": p.frequency,
                            "duration_days": p.duration_days,
                            "instructions": p.instructions,
                        }
                        for p in prescriptions
                    ],
                    "vitals": [
                        {
                            "temperature": v.temperature,
                            "heart_rate": v.heart_rate,
                            "blood_pressure": v.blood_pressure,
                            "oxygen_saturation": v.oxygen_saturation,
                            "recorded_at": v.recorded_at,
                        }
                        for v in vitals
                    ],
                }

            history.append(entry)

        return history
