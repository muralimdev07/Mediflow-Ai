"""Consultation Schemas"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ConsultationCreateRequest(BaseModel):
    visit_id: str


class ConsultationUpdateRequest(BaseModel):
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_notes: Optional[str] = None


class ConsultationRead(BaseModel):
    id: str
    visit_id: str
    doctor_id: str
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_notes: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    prescriptions: List["PrescriptionRead"] = []
    vitals: List["VitalsRead"] = []

    class Config:
        from_attributes = True


class PrescriptionCreateRequest(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration_days: Optional[int] = None
    instructions: Optional[str] = None


class PrescriptionRead(BaseModel):
    id: str
    medication_name: str
    dosage: str
    frequency: str
    duration_days: Optional[int] = None
    instructions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class VitalsCreateRequest(BaseModel):
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None


class VitalsRead(BaseModel):
    id: str
    temperature: Optional[float] = None
    heart_rate: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    recorded_at: datetime

    class Config:
        from_attributes = True


class VisitCreateRequest(BaseModel):
    """Patient check-in with symptoms."""
    chief_complaint: str
    symptoms_description: Optional[str] = None


class VisitRead(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    chief_complaint: str
    symptoms_description: Optional[str] = None
    status: str
    check_in_time: datetime
    discharge_time: Optional[datetime] = None

    class Config:
        from_attributes = True


# Resolve forward refs
ConsultationRead.model_rebuild()
