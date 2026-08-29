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
        """Get patient's comprehensive visit and consultation history with prescriptions."""
        from app.models.user import User
        from app.models.doctor import DoctorProfile, DoctorSpecialty
        from app.models.queue import QueueEntry
        from app.models.triage import TriageAssessment

        visits = self.db.query(PatientVisit).filter(
            PatientVisit.patient_id == patient_id,
        ).order_by(PatientVisit.check_in_time.desc()).all()

        history = []
        for visit in visits:
            consultation = self.db.query(Consultation).filter(
                Consultation.visit_id == visit.id
            ).first()

            queue_entry = self.db.query(QueueEntry).filter(
                QueueEntry.visit_id == visit.id
            ).first()

            token = None
            if queue_entry and queue_entry.department:
                token = f"{queue_entry.department.code}-{str(queue_entry.queue_position or 1).zfill(3)}"

            entry = {
                "id": visit.id,
                "visit_id": visit.id,
                "token": token,
                "chief_complaint": visit.chief_complaint,
                "symptoms_description": visit.symptoms_description,
                "status": visit.status,
                "check_in_time": visit.check_in_time,
                "discharge_time": visit.discharge_time,
                "created_at": visit.created_at,
                "consultation": None,
                "diagnosis": None,
                "prescriptions": [],
                "doctor": None,
            }

            if consultation:
                doctor_user = self.db.query(User).filter(User.id == consultation.doctor_id).first()
                doctor_profile = self.db.query(DoctorProfile).filter(DoctorProfile.user_id == consultation.doctor_id).first() if doctor_user else None
                
                dept_name = "General Medicine"
                if doctor_profile:
                    specialty = self.db.query(DoctorSpecialty).filter(DoctorSpecialty.doctor_id == doctor_profile.id, DoctorSpecialty.is_primary == True).first()  # noqa: E712
                    if specialty and specialty.department:
                        dept_name = specialty.department.name

                doctor_info = {
                    "id": doctor_user.id if doctor_user else consultation.doctor_id,
                    "name": doctor_user.full_name if doctor_user else "Attending Physician",
                    "email": doctor_user.email if doctor_user else "",
                    "avatar_url": doctor_user.avatar_url if doctor_user else None,
                    "specialization": f"{dept_name} Specialist",
                    "department": dept_name,
                    "hospital_name": doctor_profile.hospital_name if doctor_profile else "MediFlow Smart Hospital",
                    "consultation_room": doctor_profile.consultation_room if doctor_profile else "Room 101",
                }

                prescriptions = self.db.query(Prescription).filter(
                    Prescription.consultation_id == consultation.id
                ).all()
                vitals = self.db.query(VitalsRecord).filter(
                    VitalsRecord.consultation_id == consultation.id
                ).all()

                prescriptions_list = [
                    {
                        "id": p.id,
                        "medication_name": p.medication_name,
                        "dosage": p.dosage,
                        "frequency": p.frequency,
                        "duration_days": p.duration_days,
                        "instructions": p.instructions,
                        "created_at": p.created_at,
                    }
                    for p in prescriptions
                ]

                entry["diagnosis"] = consultation.diagnosis
                entry["prescriptions"] = prescriptions_list
                entry["doctor"] = doctor_info

                triage_rec = self.db.query(TriageAssessment).filter(TriageAssessment.visit_id == visit.id).first()
                triage_vitals = triage_rec.vitals if triage_rec else None

                vitals_list = [
                    {
                        "temperature": v.temperature,
                        "heart_rate": v.heart_rate,
                        "blood_pressure": v.blood_pressure,
                        "blood_pressure_systolic": v.blood_pressure_systolic,
                        "blood_pressure_diastolic": v.blood_pressure_diastolic,
                        "oxygen_saturation": v.oxygen_saturation,
                        "weight": v.weight,
                        "height": v.height,
                        "recorded_at": v.recorded_at,
                    }
                    for v in vitals
                ]

                # Fallback to triage vitals if vitals_records empty
                if not vitals_list and triage_vitals:
                    vitals_list = [triage_vitals]

                entry["vitals"] = vitals_list[0] if vitals_list else None
                entry["nurse_notes"] = triage_rec.nurse_notes if triage_rec else ""
                entry["triage_level"] = triage_rec.triage_level if triage_rec else "P3"

                entry["consultation"] = {
                    "id": consultation.id,
                    "diagnosis": consultation.diagnosis,
                    "clinical_notes": consultation.clinical_notes,
                    "treatment_plan": consultation.treatment_plan,
                    "follow_up_notes": consultation.follow_up_notes,
                    "doctor": doctor_info,
                    "started_at": consultation.started_at,
                    "ended_at": consultation.ended_at,
                    "prescriptions": prescriptions_list,
                    "vitals": vitals_list,
                    "nurse_notes": triage_rec.nurse_notes if triage_rec else "",
                }
            else:
                # If no consultation yet, check if triage exists
                from app.models.triage import TriageAssessment
                triage_rec = self.db.query(TriageAssessment).filter(TriageAssessment.visit_id == visit.id).first()
                if triage_rec:
                    entry["vitals"] = triage_rec.vitals
                    entry["nurse_notes"] = triage_rec.nurse_notes
                    entry["triage_level"] = triage_rec.triage_level

            history.append(entry)

        return history
