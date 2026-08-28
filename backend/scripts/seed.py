"""
MediFlow AI — Seed Data Script

Creates initial departments, rooms, admin user, and demo data.
"""

import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, time, timezone
from app.db import Base
from app.db.session import engine, SessionLocal
from app.models import *  # noqa: F403 — import all models


def seed():
    """Seed the database with initial data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ── Check if already seeded ─────────────────────────
        existing = db.query(User).filter(User.email == "admin@mediflow.ai").first()
        if existing:
            print("[Seed] Database already seeded. Skipping.")
            return

        print("[Seed] Seeding database...")

        # ── Super Admin ─────────────────────────────────────
        admin = User(
            email="admin@mediflow.ai",
            full_name="System Administrator",
            role="super_admin",
            is_active=True,
            google_id="google_mock_admin@mediflow.ai",
        )
        db.add(admin)
        db.flush()

        # ── Departments ─────────────────────────────────────
        departments_data = [
            ("General Medicine", "GEN", "General medical consultations and primary care"),
            ("Cardiology", "CARD", "Heart and cardiovascular system"),
            ("Neurology", "NEURO", "Brain and nervous system disorders"),
            ("Orthopedics", "ORTHO", "Bones, joints, and musculoskeletal system"),
            ("Pediatrics", "PEDI", "Children and adolescent medicine"),
            ("Emergency Medicine", "EMRG", "Emergency and trauma care"),
            ("Dermatology", "DERM", "Skin conditions and diseases"),
            ("ENT", "ENT", "Ear, nose, and throat"),
            ("Ophthalmology", "OPTH", "Eye care and vision"),
            ("Gynecology", "GYN", "Women's reproductive health"),
        ]

        departments = {}
        for name, code, desc in departments_data:
            dept = Department(name=name, code=code, description=desc)
            db.add(dept)
            db.flush()
            departments[code] = dept

        # ── Rooms ───────────────────────────────────────────
        room_configs = [
            ("GEN", ["G-101", "G-102", "G-103"]),
            ("CARD", ["C-201", "C-202"]),
            ("NEURO", ["N-301", "N-302"]),
            ("ORTHO", ["O-401", "O-402"]),
            ("EMRG", ["E-001", "E-002", "E-003", "E-004"]),
            ("PEDI", ["P-501", "P-502"]),
        ]

        for dept_code, room_numbers in room_configs:
            dept = departments.get(dept_code)
            if dept:
                for rnum in room_numbers:
                    room_type = "emergency" if dept_code == "EMRG" else "consultation"
                    room = Room(
                        department_id=dept.id,
                        room_number=rnum,
                        room_type=room_type,
                        status="available",
                    )
                    db.add(room)

        # ── Demo Doctors ────────────────────────────────────
        doctors_data = [
            ("dr.sharma@mediflow.ai", "Dr. Rajesh Sharma", "GEN", 15, 4.8, 500),
            ("dr.patel@mediflow.ai", "Dr. Priya Patel", "CARD", 12, 4.7, 800),
            ("dr.kumar@mediflow.ai", "Dr. Arun Kumar", "NEURO", 10, 4.6, 750),
            ("dr.gupta@mediflow.ai", "Dr. Sneha Gupta", "ORTHO", 8, 4.5, 600),
            ("dr.singh@mediflow.ai", "Dr. Manpreet Singh", "PEDI", 6, 4.9, 550),
            ("dr.reddy@mediflow.ai", "Dr. Lakshmi Reddy", "EMRG", 14, 4.4, 700),
        ]

        for email, name, dept_code, exp, rating, fee in doctors_data:
            doc_user = User(
                email=email,
                full_name=name,
                role="doctor",
                is_active=True,
                google_id=f"google_mock_{email}",
            )
            db.add(doc_user)
            db.flush()

            profile = DoctorProfile(
                user_id=doc_user.id,
                license_number=f"MED-{exp * 1000}",
                experience_years=exp,
                rating=rating,
                consultation_fee=fee,
                is_available=True,
            )
            db.add(profile)
            db.flush()

            # Add specialty
            dept = departments.get(dept_code)
            if dept:
                specialty = DoctorSpecialty(
                    doctor_id=profile.id,
                    department_id=dept.id,
                    is_primary=True,
                )
                db.add(specialty)

            # Add schedule (Mon-Fri 9am-5pm)
            for day in range(5):  # Monday to Friday
                schedule = DoctorSchedule(
                    doctor_id=profile.id,
                    day_of_week=day,
                    start_time=time(9, 0),
                    end_time=time(17, 0),
                    is_active=True,
                )
                db.add(schedule)

        # ── Demo Nurses ─────────────────────────────────────
        nurses_data = [
            ("nurse.mary@mediflow.ai", "Mary Johnson", "GEN", "morning"),
            ("nurse.anita@mediflow.ai", "Anita Desai", "EMRG", "morning"),
            ("nurse.john@mediflow.ai", "John Williams", "CARD", "afternoon"),
        ]

        for email, name, dept_code, shift in nurses_data:
            nurse_user = User(
                email=email,
                full_name=name,
                role="nurse",
                is_active=True,
                google_id=f"google_mock_{email}",
            )
            db.add(nurse_user)
            db.flush()

            dept = departments.get(dept_code)
            nurse_profile = NurseProfile(
                user_id=nurse_user.id,
                badge_number=f"NRS-{name.split()[1][:3].upper()}",
                department_id=dept.id if dept else None,
                shift=shift,
            )
            db.add(nurse_profile)

        # ── Demo Patient ────────────────────────────────────
        patient = User(
            email="patient@mediflow.ai",
            full_name="Demo Patient",
            role="patient",
            is_active=True,
            google_id="google_mock_patient@mediflow.ai",
        )
        db.add(patient)
        db.flush()

        patient_profile = PatientProfile(
            user_id=patient.id,
            gender="male",
            blood_group="O+",
            phone="9876543210",
            emergency_contact_name="Emergency Contact",
            emergency_contact_phone="9876543211",
        )
        db.add(patient_profile)

        db.commit()
        print("[Seed] Seed data created successfully!")
        print(f"  - {len(departments_data)} departments")
        print(f"  - {sum(len(r[1]) for r in room_configs)} rooms")
        print(f"  - {len(doctors_data)} doctors")
        print(f"  - {len(nurses_data)} nurses")
        print("  - 1 admin")
        print("  - 1 demo patient")
        print()
        print("Demo logins:")
        print("  Admin:   admin@mediflow.ai")
        print("  Doctor:  dr.sharma@mediflow.ai")
        print("  Nurse:   nurse.mary@mediflow.ai")
        print("  Patient: patient@mediflow.ai")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
