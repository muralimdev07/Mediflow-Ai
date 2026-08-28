from app.db.session import SessionLocal
from app.models.doctor import DoctorProfile, DoctorSpecialty
from app.models.department import Department
from app.models.user import User

db = SessionLocal()

doctors = db.query(User).filter(User.role == "doctor").all()
print(f"Total doctor users: {len(doctors)}")

for doc in doctors:
    profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doc.id).first()
    print(f"Doctor User: {doc.full_name} ({doc.id}), has profile: {bool(profile)}")
    if profile:
        specialties = db.query(DoctorSpecialty).filter(DoctorSpecialty.doctor_id == profile.id).all()
        print(f"  Profile ID: {profile.id}, fee: {profile.consultation_fee}, is_available: {profile.is_available}, specialties: {len(specialties)}")
        for sp in specialties:
            print(f"    Specialty: dept={sp.department_id}, is_primary={sp.is_primary}")

depts = db.query(Department).all()
print(f"Total departments: {len(depts)}")
for d in depts:
    print(f"Dept: {d.name} ({d.id}), active: {d.is_active}")

db.close()
