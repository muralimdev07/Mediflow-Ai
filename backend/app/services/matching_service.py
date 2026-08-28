"""
MediFlow AI — Matching Service

AI-powered doctor matching: specialty + workload + rating + availability.
"""

from datetime import datetime, timezone
from typing import List

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.consultation import Consultation
from app.models.department import Department
from app.models.doctor import DoctorProfile, DoctorSpecialty
from app.models.queue import QueueEntry
from app.models.user import User
from app.models.visit import PatientVisit


class MatchingService:
    def __init__(self, db: Session):
        self.db = db

    def find_matching_doctors(self, visit_id: str) -> List[dict]:
        """Find and rank doctors based on multiple factors for a visit."""
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == visit_id).first()
        if not visit:
            raise NotFoundError("Visit")

        # Get the queue entry to know department
        queue_entry = self.db.query(QueueEntry).filter(QueueEntry.visit_id == visit_id).first()

        # Get all active doctors
        doctors = self.db.query(User).filter(
            User.role == "doctor",
            User.is_active == True,  # noqa: E712
        ).all()

        results = []
        for doctor in doctors:
            profile = self.db.query(DoctorProfile).filter(
                DoctorProfile.user_id == doctor.id
            ).first()
            if not profile or not profile.is_available:
                continue

            score = self._calculate_match_score(
                doctor=doctor,
                profile=profile,
                visit=visit,
                queue_entry=queue_entry,
            )
            results.append(score)

        # Sort by total score descending
        results.sort(key=lambda x: x["total_score"], reverse=True)
        return results[:10]  # Top 10 matches

    def _calculate_match_score(
        self,
        doctor: User,
        profile: DoctorProfile,
        visit: PatientVisit,
        queue_entry=None,
    ) -> dict:
        """Calculate multi-factor match score for a doctor."""

        # 1. Specialty match (0-40 points)
        specialty_score = 0.0
        department_name = "General"

        if queue_entry and queue_entry.department_id:
            specialty = self.db.query(DoctorSpecialty).filter(
                DoctorSpecialty.doctor_id == profile.id,
                DoctorSpecialty.department_id == queue_entry.department_id,
            ).first()
            if specialty:
                specialty_score = 40.0 if specialty.is_primary else 30.0

            dept = self.db.query(Department).filter(
                Department.id == queue_entry.department_id
            ).first()
            if dept:
                department_name = dept.name

        # If no specific department match, check any specialties
        if specialty_score == 0:
            any_specialty = self.db.query(DoctorSpecialty).filter(
                DoctorSpecialty.doctor_id == profile.id,
            ).first()
            if any_specialty:
                specialty_score = 15.0

        # 2. Workload score (0-25 points) — fewer current patients = higher score
        active_consultations = self.db.query(Consultation).filter(
            Consultation.doctor_id == doctor.id,
            Consultation.ended_at == None,  # noqa: E711
        ).count()

        active_queue = self.db.query(QueueEntry).filter(
            QueueEntry.assigned_doctor_id == doctor.id,
            QueueEntry.status.in_(["waiting", "called", "in_progress"]),
        ).count()

        current_load = active_consultations + active_queue
        if current_load == 0:
            workload_score = 25.0
        elif current_load <= 2:
            workload_score = 20.0
        elif current_load <= 4:
            workload_score = 15.0
        elif current_load <= 6:
            workload_score = 8.0
        else:
            workload_score = 2.0

        # 3. Rating score (0-20 points)
        rating_score = min(20.0, (profile.rating / 5.0) * 20.0) if profile.rating > 0 else 10.0

        # 4. Availability score (0-15 points) — is doctor currently on schedule
        availability_score = 15.0 if profile.is_available else 0.0

        total_score = specialty_score + workload_score + rating_score + availability_score

        # Estimate wait time
        estimated_wait = current_load * 15  # ~15 min per patient

        return {
            "doctor_id": doctor.id,
            "doctor_name": doctor.full_name,
            "department": department_name,
            "specialty_match_score": round(specialty_score, 1),
            "workload_score": round(workload_score, 1),
            "rating_score": round(rating_score, 1),
            "availability_score": round(availability_score, 1),
            "total_score": round(total_score, 1),
            "estimated_wait_minutes": estimated_wait,
            "consultation_fee": profile.consultation_fee,
        }
