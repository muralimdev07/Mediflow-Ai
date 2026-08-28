"""Appointment Booking Schemas — used by the multi-step booking wizard."""

from datetime import date
from typing import Optional
import re

from pydantic import BaseModel, Field, validator


class AppointmentBookRequest(BaseModel):
    """Full patient data collected across the 5-step booking wizard."""

    # Step 1 - Patient Details
    full_name: str = Field(..., min_length=2, max_length=200)
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., description="Male | Female | Other | Prefer not to say")

    # Step 2 - Symptoms
    chief_complaint: str = Field(..., min_length=3, max_length=500)
    symptoms_description: str = Field(..., min_length=20, description="Min 20 chars")
    severity_level: Optional[int] = Field(None, ge=1, le=10)
    symptom_duration: Optional[str] = Field(None, max_length=100)

    # Step 3 - Contact & Schedule
    phone: str = Field(..., description="10-digit Indian phone or international")
    email: Optional[str] = None
    preferred_date: date
    preferred_time_slot: str = Field(..., description="e.g. 09:00 AM")
    preferred_department_id: Optional[str] = None

    @validator("gender")
    def validate_gender(cls, v):
        allowed = {"Male", "Female", "Other", "Prefer not to say"}
        if v not in allowed:
            raise ValueError(f"Gender must be one of: {', '.join(allowed)}")
        return v

    @validator("phone")
    def validate_phone(cls, v):
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^(\+?[0-9]{10,15})$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class DoctorOptionRead(BaseModel):
    doctor_id: str
    doctor_name: str
    department_name: Optional[str] = None
    department_id: Optional[str] = None
    consultation_fee: float
    rating: float
    experience_years: int
    is_available: bool

    class Config:
        from_attributes = True


class DepartmentOptionRead(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class TimeSlotRead(BaseModel):
    slot: str
    available: bool


class AppointmentBookResponse(BaseModel):
    booking_reference: str
    visit_id: str
    invoice_id: str
    invoice_number: str
    amount: float
    net_amount: float
    tax_amount: float
    queue_position: int
    estimated_wait_minutes: int
    matched_doctor: Optional[dict] = None
    ai_suggestion: Optional[dict] = None
    department_name: Optional[str] = None
    scheduled_date: Optional[str] = None
    scheduled_time_slot: Optional[str] = None
    consultation_fee: Optional[float] = None

    class Config:
        from_attributes = True


class BookingConfirmationRead(BaseModel):
    booking_reference: str
    visit_id: str
    invoice_id: str
    invoice_number: str
    payment_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    amount_paid: float
    tax_amount: float
    total_amount: float
    currency: str = "INR"
    paid_at: Optional[str] = None
    patient_name: str
    patient_phone: Optional[str] = None
    chief_complaint: str
    scheduled_date: Optional[str] = None
    scheduled_time_slot: Optional[str] = None
    doctor_name: Optional[str] = None
    department_name: Optional[str] = None
    queue_position: Optional[int] = None
    estimated_wait_minutes: Optional[int] = None
