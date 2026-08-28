"""Doctor Profile, Specialty, and Schedule Models"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from app.db import Base


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    license_number = Column(String(100), nullable=True)
    experience_years = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    total_consultations = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    consultation_fee = Column(Float, default=500.0)  # Default fee in INR
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    specialties = relationship("DoctorSpecialty", back_populates="doctor", cascade="all, delete-orphan")
    schedules = relationship("DoctorSchedule", back_populates="doctor", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<DoctorProfile user_id={self.user_id}>"


class DoctorSpecialty(Base):
    __tablename__ = "doctor_specialties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    doctor = relationship("DoctorProfile", back_populates="specialties")
    department = relationship("Department")

    def __repr__(self):
        return f"<DoctorSpecialty doctor={self.doctor_id} dept={self.department_id}>"


class DoctorSchedule(Base):
    __tablename__ = "doctor_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doctor_id = Column(String(36), ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    doctor = relationship("DoctorProfile", back_populates="schedules")

    def __repr__(self):
        return f"<DoctorSchedule doctor={self.doctor_id} day={self.day_of_week}>"
