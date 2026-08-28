"""
MediFlow AI — Analytics Service

Dashboard metrics and reporting.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.consultation import Consultation
from app.models.department import Department
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.queue import QueueEntry
from app.models.user import User
from app.models.visit import PatientVisit


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_overview(self) -> dict:
        """Dashboard overview metrics."""
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        # Today's visits
        visits_today = self.db.query(PatientVisit).filter(
            PatientVisit.check_in_time >= today,
        ).count()

        # Active queue
        active_queue = self.db.query(QueueEntry).filter(
            QueueEntry.status.in_(["waiting", "called", "in_progress"]),
        ).count()

        # Total patients
        total_patients = self.db.query(User).filter(User.role == "patient").count()

        # Total doctors
        total_doctors = self.db.query(User).filter(User.role == "doctor", User.is_active == True).count()  # noqa: E712

        # Consultations today
        consultations_today = self.db.query(Consultation).filter(
            Consultation.started_at >= today,
        ).count()

        # Completed today
        completed_today = self.db.query(PatientVisit).filter(
            PatientVisit.status.in_(["completed", "discharged"]),
            PatientVisit.discharge_time >= today,
        ).count()

        # Average wait time today
        completed_queue = self.db.query(QueueEntry).filter(
            QueueEntry.status == "completed",
            QueueEntry.completed_at >= today,
        ).all()

        avg_wait = 0.0
        if completed_queue:
            waits = []
            for e in completed_queue:
                if e.called_at:
                    wait = (e.called_at - e.entered_at).total_seconds() / 60
                    waits.append(wait)
            avg_wait = round(sum(waits) / len(waits), 1) if waits else 0.0

        return {
            "visits_today": visits_today,
            "active_queue": active_queue,
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "consultations_today": consultations_today,
            "completed_today": completed_today,
            "average_wait_minutes": avg_wait,
        }

    def get_queue_stats(self) -> list:
        """Queue stats per department."""
        departments = self.db.query(Department).filter(Department.is_active == True).all()  # noqa: E712
        stats = []

        for dept in departments:
            waiting = self.db.query(QueueEntry).filter(
                QueueEntry.department_id == dept.id,
                QueueEntry.status == "waiting",
            ).count()

            in_progress = self.db.query(QueueEntry).filter(
                QueueEntry.department_id == dept.id,
                QueueEntry.status.in_(["called", "in_progress"]),
            ).count()

            stats.append({
                "department_id": dept.id,
                "department_name": dept.name,
                "waiting": waiting,
                "in_progress": in_progress,
                "total_active": waiting + in_progress,
            })

        return stats

    def get_revenue_stats(self, days: int = 30) -> dict:
        """Revenue analytics for admin dashboard."""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        total_revenue = self.db.query(func.sum(Payment.amount)).filter(
            Payment.status == "captured",
            Payment.created_at >= start_date,
        ).scalar() or 0.0

        total_invoices = self.db.query(Invoice).filter(
            Invoice.created_at >= start_date,
        ).count()

        paid_invoices = self.db.query(Invoice).filter(
            Invoice.status == "paid",
            Invoice.created_at >= start_date,
        ).count()

        pending_invoices = self.db.query(Invoice).filter(
            Invoice.status == "pending",
            Invoice.created_at >= start_date,
        ).count()

        pending_amount = self.db.query(func.sum(Invoice.net_amount)).filter(
            Invoice.status == "pending",
            Invoice.created_at >= start_date,
        ).scalar() or 0.0

        return {
            "total_revenue": round(float(total_revenue), 2),
            "total_invoices": total_invoices,
            "paid_invoices": paid_invoices,
            "pending_invoices": pending_invoices,
            "pending_amount": round(float(pending_amount), 2),
            "period_days": days,
        }
