"""Queue Entry Model — tracks position and priority in department queue."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    visit_id = Column(String(36), ForeignKey("patient_visits.id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False, index=True)
    assigned_doctor_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    room_id = Column(String(36), ForeignKey("rooms.id"), nullable=True)
    priority_score = Column(Integer, default=50, nullable=False)  # 0-100, higher = more urgent
    triage_level = Column(
        Enum("P1", "P2", "P3", "P4", "P5", name="triage_level_enum"),
        default="P5",
        nullable=False,
    )
    queue_position = Column(Integer, nullable=True)
    estimated_wait_minutes = Column(Integer, nullable=True)
    status = Column(
        Enum(
            "waiting", "called", "in_progress", "completed",
            "skipped", "transferred", "cancelled",
            name="queue_status_enum",
        ),
        default="waiting",
        nullable=False,
        index=True,
    )
    entered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    visit = relationship("PatientVisit", back_populates="queue_entry")
    department = relationship("Department")
    assigned_doctor = relationship("User", foreign_keys=[assigned_doctor_id])
    room = relationship("Room")

    def __repr__(self):
        return f"<QueueEntry pos={self.queue_position} priority={self.priority_score} status={self.status}>"
