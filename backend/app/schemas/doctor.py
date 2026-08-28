"""Doctor Schemas"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class DoctorProfileRead(BaseModel):
    id: str
    user_id: str
    license_number: Optional[str] = None
    experience_years: int = 0
    rating: float = 0.0
    total_consultations: int = 0
    is_available: bool = True
    consultation_fee: float = 500.0
    specialties: List["DoctorSpecialtyRead"] = []

    class Config:
        from_attributes = True


class DoctorSpecialtyRead(BaseModel):
    id: str
    department_id: str
    department_name: Optional[str] = None
    is_primary: bool = False

    class Config:
        from_attributes = True


class DoctorMatchResult(BaseModel):
    """Result from the matching engine."""
    doctor_id: str
    doctor_name: str
    department: str
    specialty_match_score: float
    workload_score: float
    rating_score: float
    availability_score: float
    total_score: float
    estimated_wait_minutes: int
    consultation_fee: float


DoctorProfileRead.model_rebuild()
