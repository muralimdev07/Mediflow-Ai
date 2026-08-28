"""Queue Schemas"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class QueueEntryRead(BaseModel):
    id: str
    visit_id: str
    department_id: str
    department_name: Optional[str] = None
    assigned_doctor_id: Optional[str] = None
    assigned_doctor_name: Optional[str] = None
    room_id: Optional[str] = None
    room_number: Optional[str] = None
    patient_name: Optional[str] = None
    chief_complaint: Optional[str] = None
    priority_score: int
    triage_level: str
    queue_position: Optional[int] = None
    estimated_wait_minutes: Optional[int] = None
    status: str
    entered_at: datetime
    called_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QueueCallRequest(BaseModel):
    """Call a patient from the queue."""
    room_id: Optional[str] = None


class QueueAssignDoctorRequest(BaseModel):
    doctor_id: str


class QueueAssignRoomRequest(BaseModel):
    room_id: str


class QueueStatsRead(BaseModel):
    """Queue statistics for a department."""
    department_id: str
    department_name: str
    total_waiting: int
    total_in_progress: int
    average_wait_minutes: float
    p1_count: int
    p2_count: int
    p3_count: int
    p4_count: int
    p5_count: int
