"""
Safe Column Migration for MySQL / SQLite.
Adds columns if not present.
"""

from sqlalchemy import text
from app.db.session import engine, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.doctor import DoctorProfile

def migrate_and_sync():
    with engine.connect() as conn:
        # Check and add password_hash to users
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL;"))
            conn.commit()
            print("[Migration] Added password_hash column to users.")
        except Exception as e:
            print(f"[Migration] users.password_hash check: {e}")

        # Check and add status_label, consultation_room, hospital_name to doctor_profiles
        try:
            conn.execute(text("ALTER TABLE doctor_profiles ADD COLUMN status_label VARCHAR(50) DEFAULT 'AVAILABLE';"))
            conn.commit()
            print("[Migration] Added status_label column to doctor_profiles.")
        except Exception as e:
            print(f"[Migration] doctor_profiles.status_label check: {e}")

        try:
            conn.execute(text("ALTER TABLE doctor_profiles ADD COLUMN consultation_room VARCHAR(50) DEFAULT 'Room 101';"))
            conn.commit()
            print("[Migration] Added consultation_room column to doctor_profiles.")
        except Exception as e:
            print(f"[Migration] doctor_profiles.consultation_room check: {e}")

        try:
            conn.execute(text("ALTER TABLE doctor_profiles ADD COLUMN hospital_name VARCHAR(255) DEFAULT 'MediFlow Smart Hospital';"))
            conn.commit()
            print("[Migration] Added hospital_name column to doctor_profiles.")
        except Exception as e:
            print(f"[Migration] doctor_profiles.hospital_name check: {e}")

    # Now update doctor credentials
    db = SessionLocal()
    try:
        doctors = db.query(User).filter(User.role == "doctor").all()
        print(f"[Sync] Found {len(doctors)} doctors in the database.")
        default_hash = hash_password("Doctor@123")

        room_assignments = {
            "dr.sharma@mediflow.ai": "Room 101",
            "dr.patel@mediflow.ai": "Room 201",
            "dr.kumar@mediflow.ai": "Room 301",
            "dr.gupta@mediflow.ai": "Room 401",
            "dr.singh@mediflow.ai": "Room 501",
            "dr.reddy@mediflow.ai": "Emergency Room E-01",
        }

        for doc in doctors:
            doc.password_hash = default_hash
            profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doc.id).first()
            if profile:
                profile.status_label = "AVAILABLE"
                profile.is_available = True
                profile.hospital_name = "MediFlow Smart Hospital"
                profile.consultation_room = room_assignments.get(doc.email, "Room 101")
            print(f"[Sync] Configured Doctor credentials: {doc.full_name} ({doc.email}) -> Room: {room_assignments.get(doc.email, 'Room 101')}")

        db.commit()
        print("[Sync] Successfully configured doctor accounts!")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_and_sync()
