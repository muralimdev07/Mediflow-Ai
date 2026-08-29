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
    token: Optional[str] = None
    currently_serving_token: Optional[str] = None
    patients_ahead: Optional[int] = None
    hospital_name: Optional[str] = "MediFlow Smart Hospital"
    entered_at: datetime
    called_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class QueueTokenItem(BaseModel):
    token: str
    status: str
    is_me: bool = False
    is_current: bool = False


class PatientQueueDetail(BaseModel):
    id: str
    visit_id: str
    department_id: str
    department_name: str
    hospital_name: str = "MediFlow Smart Hospital"
    assigned_doctor_id: Optional[str] = None
    assigned_doctor_name: Optional[str] = None
    room_id: Optional[str] = None
    room_number: Optional[str] = None
    priority_score: int
    triage_level: str
    queue_position: int
    token: str
    currently_serving_token: str
    patients_ahead: int
    estimated_wait_minutes: int
    ai_prediction_details: dict
    status: str
    entered_at: datetime
    called_at: Optional[datetime] = None
    queue_list: list[QueueTokenItem] = []


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

