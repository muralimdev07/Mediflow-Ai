"""
MediFlow AI — Queue Service

Queue orchestration: check-in, triage, room assignment, doctor handoff, discharge.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.department import Department
from app.models.queue import QueueEntry
from app.models.room import Room
from app.models.user import User
from app.models.visit import PatientVisit


class QueueService:
    def __init__(self, db: Session):
        self.db = db

    def create_visit_and_queue(
        self,
        patient_id: str,
        chief_complaint: str,
        symptoms_description: Optional[str] = None,
        department_id: Optional[str] = None,
    ) -> tuple[PatientVisit, QueueEntry]:
        """Patient check-in: create visit and add to queue."""

        # Check for active visit
        active = self.db.query(PatientVisit).filter(
            PatientVisit.patient_id == patient_id,
            PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
        ).first()
        if active:
            raise ConflictError("Patient already has an active visit")

        # Default department if not specified
        if not department_id:
            dept = self.db.query(Department).filter(Department.is_active == True).first()  # noqa: E712
            if dept:
                department_id = dept.id

        # Create visit
        visit = PatientVisit(
            patient_id=patient_id,
            chief_complaint=chief_complaint,
            symptoms_description=symptoms_description,
            status="checked_in",
        )
        self.db.add(visit)
        self.db.flush()

        # Calculate queue position
        current_max = self.db.query(func.max(QueueEntry.queue_position)).filter(
            QueueEntry.department_id == department_id,
            QueueEntry.status.in_(["waiting", "called"]),
        ).scalar() or 0

        # Create queue entry
        queue_entry = QueueEntry(
            visit_id=visit.id,
            department_id=department_id,
            priority_score=50,  # Default, updated after triage
            triage_level="P5",  # Default, updated after triage
            queue_position=current_max + 1,
            status="waiting",
        )
        self.db.add(queue_entry)
        self.db.commit()
        self.db.refresh(visit)
        self.db.refresh(queue_entry)

        return visit, queue_entry

    def get_department_queue(
        self,
        department_id: str,
        status: Optional[str] = None,
    ) -> List[QueueEntry]:
        """Get queue for a department, ordered by priority then time."""
        query = self.db.query(QueueEntry).filter(
            QueueEntry.department_id == department_id,
        )

        if status:
            query = query.filter(QueueEntry.status == status)
        else:
            query = query.filter(QueueEntry.status.in_(["waiting", "called", "in_progress"]))

        return query.order_by(
            QueueEntry.priority_score.desc(),
            QueueEntry.entered_at.asc(),
        ).all()

    def get_active_queue(self) -> List[QueueEntry]:
        """Get all active queue entries across departments."""
        return self.db.query(QueueEntry).filter(
            QueueEntry.status.in_(["waiting", "called", "in_progress"]),
        ).order_by(
            QueueEntry.priority_score.desc(),
            QueueEntry.entered_at.asc(),
        ).all()

    def call_patient(self, queue_entry_id: str, room_id: Optional[str] = None) -> QueueEntry:
        """Call next patient from queue to room."""
        entry = self.db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
        if not entry:
            raise NotFoundError("Queue entry")

        if entry.status not in ("waiting",):
            raise ValidationError(f"Cannot call patient with status '{entry.status}'")

        entry.status = "called"
        entry.called_at = datetime.now(timezone.utc)

        if room_id:
            room = self.db.query(Room).filter(Room.id == room_id).first()
            if room:
                entry.room_id = room_id
                room.status = "occupied"

        # Update visit status
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == entry.visit_id).first()
        if visit:
            visit.status = "called"

        self.db.commit()
        self.db.refresh(entry)
        return entry

    def assign_doctor(self, queue_entry_id: str, doctor_id: str) -> QueueEntry:
        """Assign a doctor to a queue entry."""
        entry = self.db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
        if not entry:
            raise NotFoundError("Queue entry")

        doctor = self.db.query(User).filter(User.id == doctor_id, User.role == "doctor").first()
        if not doctor:
            raise NotFoundError("Doctor")

        entry.assigned_doctor_id = doctor_id
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def assign_room(self, queue_entry_id: str, room_id: str) -> QueueEntry:
        """Assign room to queue entry."""
        entry = self.db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
        if not entry:
            raise NotFoundError("Queue entry")

        room = self.db.query(Room).filter(Room.id == room_id).first()
        if not room:
            raise NotFoundError("Room")
        if room.status != "available":
            raise ValidationError(f"Room {room.room_number} is not available")

        entry.room_id = room_id
        room.status = "occupied"
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_triage(self, queue_entry_id: str, triage_level: str, priority_score: int) -> QueueEntry:
        """Update queue entry after triage assessment."""
        entry = self.db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
        if not entry:
            raise NotFoundError("Queue entry")

        entry.triage_level = triage_level
        entry.priority_score = priority_score

        # Re-sort queue by priority
        self._recalculate_positions(entry.department_id)

        self.db.commit()
        self.db.refresh(entry)
        return entry

    def complete_queue_entry(self, queue_entry_id: str) -> QueueEntry:
        """Mark queue entry as completed (consultation done)."""
        entry = self.db.query(QueueEntry).filter(QueueEntry.id == queue_entry_id).first()
        if not entry:
            raise NotFoundError("Queue entry")

        entry.status = "completed"
        entry.completed_at = datetime.now(timezone.utc)

        # Free up room
        if entry.room_id:
            room = self.db.query(Room).filter(Room.id == entry.room_id).first()
            if room:
                room.status = "available"

        # Update visit
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == entry.visit_id).first()
        if visit:
            visit.status = "completed"
            visit.discharge_time = datetime.now(timezone.utc)

        self._recalculate_positions(entry.department_id)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_patient_active_queue(self, patient_id: str) -> Optional[QueueEntry]:
        """Get patient's current active queue entry."""
        visit = self.db.query(PatientVisit).filter(
            PatientVisit.patient_id == patient_id,
            PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
        ).first()

        if not visit:
            return None

        return self.db.query(QueueEntry).filter(
            QueueEntry.visit_id == visit.id,
            QueueEntry.status.in_(["waiting", "called", "in_progress"]),
        ).first()

    def get_queue_stats(self, department_id: str) -> dict:
        """Get queue statistics for a department."""
        entries = self.db.query(QueueEntry).filter(
            QueueEntry.department_id == department_id,
            QueueEntry.status.in_(["waiting", "called", "in_progress"]),
        ).all()

        waiting = [e for e in entries if e.status == "waiting"]
        in_progress = [e for e in entries if e.status in ("called", "in_progress")]

        # Calculate avg wait time for completed entries today
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
        completed_today = self.db.query(QueueEntry).filter(
            QueueEntry.department_id == department_id,
            QueueEntry.status == "completed",
            QueueEntry.completed_at >= today_start,
        ).all()

        avg_wait = 0.0
        if completed_today:
            waits = []
            for e in completed_today:
                if e.called_at and e.entered_at:
                    wait = (e.called_at - e.entered_at).total_seconds() / 60
                    waits.append(wait)
            avg_wait = sum(waits) / len(waits) if waits else 0.0

        triage_counts = {"P1": 0, "P2": 0, "P3": 0, "P4": 0, "P5": 0}
        for e in waiting:
            if e.triage_level in triage_counts:
                triage_counts[e.triage_level] += 1

        dept = self.db.query(Department).filter(Department.id == department_id).first()

        return {
            "department_id": department_id,
            "department_name": dept.name if dept else "",
            "total_waiting": len(waiting),
            "total_in_progress": len(in_progress),
            "average_wait_minutes": round(avg_wait, 1),
            **{f"{k.lower()}_count": v for k, v in triage_counts.items()},
        }

    def _recalculate_positions(self, department_id: str):
        """Recalculate queue positions based on priority score."""
        entries = self.db.query(QueueEntry).filter(
            QueueEntry.department_id == department_id,
            QueueEntry.status == "waiting",
        ).order_by(
            QueueEntry.priority_score.desc(),
            QueueEntry.entered_at.asc(),
        ).all()

        for idx, entry in enumerate(entries, start=1):
            entry.queue_position = idx
            # Estimate wait: ~15 min per patient ahead
            entry.estimated_wait_minutes = (idx - 1) * 15
