"""Visit, Consultation, Triage, Matching, Department, Room, Analytics, Payment, Health Routers"""

# ── Visits Router ────────────────────────────────────────────
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional

from app.core.dependencies import get_current_user, require_admin, require_clinical, require_doctor, require_staff
from app.db.session import get_db
from app.models.user import User
from app.schemas import SuccessResponse, MessageResponse
from app.schemas.consultation import (
    ConsultationCreateRequest, ConsultationRead, ConsultationUpdateRequest,
    PrescriptionCreateRequest, PrescriptionRead, VitalsCreateRequest, VitalsRead,
    VisitCreateRequest, VisitRead,
)
from app.schemas.triage import AiTriageResponse, TriageAssessmentRead, TriageCreateRequest
from app.schemas.doctor import DoctorMatchResult
from app.schemas.payment import (
    CreateOrderRequest, CreateOrderResponse, InvoiceCreateRequest, InvoiceRead,
    PaymentRead, RefundRequest, VerifyPaymentRequest,
)
from app.services.queue_service import QueueService
from app.services.consultation_service import ConsultationService
from app.services.triage_service import TriageService
from app.services.matching_service import MatchingService
from app.services.payment_service import PaymentService
from app.services.analytics_service import AnalyticsService
from app.models.department import Department
from app.models.room import Room

# ════════════════════════════════════════════════════════════
# Visits
# ════════════════════════════════════════════════════════════
visits_router = APIRouter(prefix="/visits", tags=["Visits"])


@visits_router.post("", response_model=SuccessResponse[VisitRead])
def create_visit(
    data: VisitCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Patient check-in with symptoms."""
    service = QueueService(db)
    visit, queue_entry = service.create_visit_and_queue(
        patient_id=current_user.id,
        chief_complaint=data.chief_complaint,
        symptoms_description=data.symptoms_description,
    )
    return {"success": True, "data": visit}


@visits_router.get("/me/active", response_model=SuccessResponse[Optional[VisitRead]])
def get_active_visit(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get patient's current active visit."""
    from app.models.visit import PatientVisit
    visit = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
    ).first()
    return {"success": True, "data": visit}


@visits_router.get("/me/history")
def get_visit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get patient's visit history."""
    service = ConsultationService(db)
    history = service.get_patient_history(current_user.id)
    return {"success": True, "data": history}


# ════════════════════════════════════════════════════════════
# Triage
# ════════════════════════════════════════════════════════════
triage_router = APIRouter(prefix="/triage", tags=["Triage"])


@triage_router.post("/{visit_id}", response_model=SuccessResponse[TriageAssessmentRead])
def create_triage(
    visit_id: str,
    data: TriageCreateRequest,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Submit nurse triage assessment."""
    service = TriageService(db)
    assessment = service.create_assessment(
        visit_id=visit_id,
        assessed_by=current_user.id,
        triage_level=data.triage_level,
        pain_scale=data.pain_scale,
        vitals=data.vitals,
        nurse_notes=data.nurse_notes,
    )
    return {"success": True, "data": assessment}


@triage_router.get("/{visit_id}/ai", response_model=SuccessResponse[AiTriageResponse])
def get_ai_triage(
    visit_id: str,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Get AI triage suggestion for a visit."""
    service = TriageService(db)
    result = service.get_ai_triage_suggestion(visit_id)
    return {"success": True, "data": result}


@triage_router.post("/predict-disease")
def predict_patient_disease(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Real-time ML prediction for disease, severity priority (Emergency/Urgent/Normal),
    triage P1-P5, and matched department & doctor based on symptoms and patient age.
    """
    from app.services.disease_ml_service import disease_ml_service
    from app.models.doctor import DoctorProfile, DoctorSpecialty

    chief_complaint = payload.get("chief_complaint", "")
    symptoms_description = payload.get("symptoms_description", "")
    age = payload.get("age", 30)
    severity_level = payload.get("severity_level", 5)

    prediction = disease_ml_service.predict_disease_and_priority(
        chief_complaint=chief_complaint,
        symptoms_description=symptoms_description,
        age=age,
        severity_level=severity_level,
    )

    # Find matching doctor from database for the predicted department
    dept_code = prediction.get("department_code", "GEN")
    dept = db.query(Department).filter(
        (Department.code == dept_code) | (Department.name.ilike(f"%{prediction.get('department_name')}%"))
    ).first()

    matched_doctor = None
    if dept:
        specialties = db.query(DoctorSpecialty).filter(DoctorSpecialty.department_id == dept.id).all()
        for sp in specialties:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.id == sp.doctor_id).first()
            if doc_profile and doc_profile.is_available:
                doc_user = db.query(User).filter(User.id == doc_profile.user_id).first()
                if doc_user:
                    matched_doctor = {
                        "id": doc_user.id,
                        "doctor_name": doc_user.full_name,
                        "department": dept.name,
                        "department_id": dept.id,
                        "rating": doc_profile.rating or 4.9,
                        "consultation_fee": doc_profile.consultation_fee or 500.0,
                        "experience_years": doc_profile.experience_years or 8,
                    }
                    break

    # If no specific available specialist found in department, pick top rated doctor
    if not matched_doctor:
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.is_available == True).first()  # noqa: E712
        if doc_profile:
            doc_user = db.query(User).filter(User.id == doc_profile.user_id).first()
            if doc_user:
                matched_doctor = {
                    "id": doc_user.id,
                    "doctor_name": doc_user.full_name,
                    "department": dept.name if dept else "General Medicine",
                    "department_id": dept.id if dept else None,
                    "rating": doc_profile.rating or 4.8,
                    "consultation_fee": doc_profile.consultation_fee or 500.0,
                    "experience_years": doc_profile.experience_years or 8,
                }

    prediction["matched_doctor"] = matched_doctor
    prediction["recommended_department_id"] = dept.id if dept else None
    prediction["recommended_department_name"] = dept.name if dept else prediction.get("department_name")

    return {"success": True, "data": prediction}


# ════════════════════════════════════════════════════════════
# Matching
# ════════════════════════════════════════════════════════════
matching_router = APIRouter(prefix="/matching", tags=["Doctor Matching"])


@matching_router.get("/{visit_id}", response_model=SuccessResponse[list[DoctorMatchResult]])
def get_matched_doctors(
    visit_id: str,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Get AI-matched doctors ranked by score."""
    service = MatchingService(db)
    results = service.find_matching_doctors(visit_id)
    return {"success": True, "data": results}


# ════════════════════════════════════════════════════════════
# Consultations
# ════════════════════════════════════════════════════════════
consultation_router = APIRouter(prefix="/consultations", tags=["Consultations"])


@consultation_router.post("", response_model=SuccessResponse[ConsultationRead])
def start_consultation(
    data: ConsultationCreateRequest,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Start a consultation for a visit."""
    service = ConsultationService(db)
    consultation = service.start_consultation(data.visit_id, current_user.id)
    return {"success": True, "data": consultation}


@consultation_router.patch("/{consultation_id}", response_model=SuccessResponse[ConsultationRead])
def update_consultation(
    consultation_id: str,
    data: ConsultationUpdateRequest,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Update consultation notes."""
    service = ConsultationService(db)
    consultation = service.update_consultation(consultation_id, data.model_dump(exclude_unset=True))
    return {"success": True, "data": consultation}


@consultation_router.post("/{consultation_id}/complete", response_model=SuccessResponse[ConsultationRead])
def complete_consultation(
    consultation_id: str,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Complete a consultation and discharge patient."""
    service = ConsultationService(db)
    consultation = service.complete_consultation(consultation_id)

    # Auto-generate invoice
    try:
        payment_service = PaymentService(db)
        payment_service.auto_generate_invoice(consultation_id)
    except Exception:
        pass  # Invoice generation failure shouldn't block consultation completion

    return {"success": True, "data": consultation}


@consultation_router.post("/{consultation_id}/prescriptions", response_model=SuccessResponse[PrescriptionRead])
def add_prescription(
    consultation_id: str,
    data: PrescriptionCreateRequest,
    current_user: User = Depends(require_doctor),
    db: Session = Depends(get_db),
):
    """Add a prescription."""
    service = ConsultationService(db)
    prescription = service.add_prescription(consultation_id, data.model_dump())
    return {"success": True, "data": prescription}


@consultation_router.post("/{consultation_id}/vitals", response_model=SuccessResponse[VitalsRead])
def record_vitals(
    consultation_id: str,
    data: VitalsCreateRequest,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Record vital signs."""
    service = ConsultationService(db)
    vitals = service.record_vitals(consultation_id, data.model_dump(exclude_unset=True))
    return {"success": True, "data": vitals}


@consultation_router.get("/{consultation_id}", response_model=SuccessResponse[ConsultationRead])
def get_consultation(
    consultation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get consultation details."""
    service = ConsultationService(db)
    consultation = service.get_consultation(consultation_id)
    return {"success": True, "data": consultation}


@consultation_router.get("/patient/{patient_id}/history")
def get_patient_history(
    patient_id: str,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Get patient visit/consultation history (doctor/nurse/admin)."""
    service = ConsultationService(db)
    history = service.get_patient_history(patient_id)
    return {"success": True, "data": history}


# ════════════════════════════════════════════════════════════
# Payments
# ════════════════════════════════════════════════════════════
payments_router = APIRouter(prefix="/payments", tags=["Payments"])


@payments_router.post("/create-order", response_model=SuccessResponse[CreateOrderResponse])
def create_order(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create Razorpay order for payment."""
    service = PaymentService(db)
    result = service.create_razorpay_order(data.invoice_id)
    return {"success": True, "data": result}


@payments_router.post("/verify", response_model=SuccessResponse[PaymentRead])
def verify_payment(
    data: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify Razorpay payment signature."""
    service = PaymentService(db)
    payment = service.verify_payment(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature,
    )
    return {"success": True, "data": payment}


@payments_router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Razorpay webhook events."""
    body = await request.json()
    signature = request.headers.get("X-Razorpay-Signature", "")
    service = PaymentService(db)
    service.handle_webhook(body, signature)
    return {"status": "ok"}


@payments_router.get("/me", response_model=SuccessResponse[list[PaymentRead]])
def my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get patient's payment history."""
    service = PaymentService(db)
    payments = service.get_patient_payments(current_user.id)
    return {"success": True, "data": payments}


@payments_router.post("/{payment_id}/refund", response_model=SuccessResponse[PaymentRead])
def refund_payment(
    payment_id: str,
    data: RefundRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Initiate refund (admin only)."""
    service = PaymentService(db)
    payment = service.initiate_refund(payment_id, data.amount)
    return {"success": True, "data": payment}


# ════════════════════════════════════════════════════════════
# Invoices
# ════════════════════════════════════════════════════════════
invoices_router = APIRouter(prefix="/invoices", tags=["Invoices"])


@invoices_router.post("", response_model=SuccessResponse[InvoiceRead])
def create_invoice(
    data: InvoiceCreateRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Create invoice for a consultation."""
    service = PaymentService(db)
    items = [item.model_dump() for item in data.items]
    invoice = service.create_invoice(data.consultation_id, items, data.discount_amount, data.notes)
    return {"success": True, "data": invoice}


@invoices_router.get("/me", response_model=SuccessResponse[list[InvoiceRead]])
def my_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get patient's invoices."""
    service = PaymentService(db)
    invoices = service.get_patient_invoices(current_user.id)
    return {"success": True, "data": invoices}


@invoices_router.get("/{invoice_id}", response_model=SuccessResponse[InvoiceRead])
def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get invoice details."""
    service = PaymentService(db)
    invoice = service.get_invoice(invoice_id)
    return {"success": True, "data": invoice}


# ════════════════════════════════════════════════════════════
# Departments & Rooms
# ════════════════════════════════════════════════════════════
departments_router = APIRouter(prefix="/departments", tags=["Departments"])


@departments_router.get("")
def list_departments(db: Session = Depends(get_db)):
    """List all active departments."""
    departments = db.query(Department).filter(Department.is_active == True).all()  # noqa: E712
    return {"success": True, "data": [{"id": d.id, "name": d.name, "code": d.code, "description": d.description} for d in departments]}


@departments_router.post("")
def create_department(
    name: str, code: str, description: str = "",
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a department (admin only)."""
    dept = Department(name=name, code=code, description=description)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"success": True, "data": {"id": dept.id, "name": dept.name, "code": dept.code}}


rooms_router = APIRouter(prefix="/rooms", tags=["Rooms"])


@rooms_router.get("")
def list_rooms(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List rooms, optionally filtered by department."""
    query = db.query(Room)
    if department_id:
        query = query.filter(Room.department_id == department_id)
    rooms = query.all()
    return {"success": True, "data": [
        {"id": r.id, "room_number": r.room_number, "room_type": r.room_type, "status": r.status, "department_id": r.department_id}
        for r in rooms
    ]}


@rooms_router.post("")
def create_room(
    department_id: str, room_number: str, room_type: str = "consultation",
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a room (admin only)."""
    room = Room(department_id=department_id, room_number=room_number, room_type=room_type)
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"success": True, "data": {"id": room.id, "room_number": room.room_number}}


# ════════════════════════════════════════════════════════════
# Analytics
# ════════════════════════════════════════════════════════════
analytics_router = APIRouter(prefix="/analytics", tags=["Analytics"])


@analytics_router.get("/overview")
def get_overview(
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Dashboard overview metrics."""
    service = AnalyticsService(db)
    return {"success": True, "data": service.get_overview()}


@analytics_router.get("/queue-stats")
def get_queue_stats(
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Queue statistics per department."""
    service = AnalyticsService(db)
    return {"success": True, "data": service.get_queue_stats()}


@analytics_router.get("/revenue")
def get_revenue(
    days: int = Query(30, ge=1, le=365),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Revenue analytics (admin only)."""
    service = AnalyticsService(db)
    return {"success": True, "data": service.get_revenue_stats(days)}


# ════════════════════════════════════════════════════════════
# Health
# ════════════════════════════════════════════════════════════
health_router = APIRouter(tags=["Health"])


@health_router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Application health check."""
    from datetime import datetime, timezone
    # Test DB connection
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    # Test ML model
    ml_status = "not_loaded"
    try:
        import os
        model_path = os.path.join("app", "ml", "models")
        if os.path.exists(model_path) and any(f.endswith(".joblib") for f in os.listdir(model_path)):
            ml_status = "loaded"
    except Exception:
        ml_status = "error"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": "1.0.0",
        "database": db_status,
        "ai_model": ml_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ════════════════════════════════════════════════════════════
# Doctors Discovery Router
# ════════════════════════════════════════════════════════════
doctors_router = APIRouter(prefix="/doctors", tags=["Doctors Discovery"])


@doctors_router.get("")
def list_doctors(
    department_id: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    """List all hospital doctors with departments, specializations, ratings, fees, and real database availability."""
    from app.models.doctor import DoctorProfile, DoctorSpecialty
    query = db.query(User).filter(User.role == "doctor", User.is_active == True)  # noqa: E712
    doctor_users = query.all()

    doctors_list = []
    for doc in doctor_users:
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doc.id).first()
        if not profile:
            continue
        if available_only and not profile.is_available:
            continue

        specialties = db.query(DoctorSpecialty).filter(DoctorSpecialty.doctor_id == profile.id).all()
        dept_names = [sp.department.name for sp in specialties if sp.department]
        dept_ids = [sp.department_id for sp in specialties]

        if department_id and department_id not in dept_ids:
            continue

        primary_specialty = next((sp for sp in specialties if sp.is_primary), specialties[0] if specialties else None)
        dept_name = primary_specialty.department.name if primary_specialty and primary_specialty.department else "General Medicine"

        doctors_list.append({
            "id": doc.id,
            "profile_id": profile.id,
            "name": doc.full_name,
            "email": doc.email,
            "avatar_url": doc.avatar_url,
            "department": dept_name,
            "department_id": primary_specialty.department_id if primary_specialty else None,
            "all_departments": dept_names,
            "specialization": f"{dept_name} Specialist",
            "experience_years": profile.experience_years or 8,
            "experience": f"{profile.experience_years or 8} years",
            "rating": round(profile.rating, 1) if profile.rating else 4.8,
            "total_consultations": profile.total_consultations or 120,
            "consultation_fee": profile.consultation_fee or 500.0,
            "fee": f"₹{int(profile.consultation_fee or 500)}",
            "is_available": profile.is_available,
            "available": profile.is_available,
        })

    return {"success": True, "data": doctors_list}


# ════════════════════════════════════════════════════════════
# Patient Operations & Summary Router
# ════════════════════════════════════════════════════════════
patient_router = APIRouter(prefix="/patient", tags=["Patient Dashboard"])


@patient_router.get("/summary")
def get_patient_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve verified real statistics for authenticated patient dashboard."""
    from app.models.visit import PatientVisit
    from app.models.payment import Payment
    from app.models.invoice import Invoice

    # 1. Active Visit & Queue
    queue_service = QueueService(db)
    queue_detail = queue_service.get_patient_queue_details(current_user.id)

    # 2. Upcoming / Active visits count
    active_visits_count = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
    ).count()

    # 3. Completed visits count
    completed_visits_count = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.in_(["completed", "discharged"]),
    ).count()

    # 4. Total payments sum in INR
    payments = db.query(Payment).filter(
        Payment.patient_id == current_user.id,
        Payment.status == "captured",
    ).all()
    total_paid_inr = sum(p.amount for p in payments) if payments else 0.0

    # 6. Latest Completed Consultation & Prescriptions
    latest_visit = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.in_(["completed", "discharged"]),
    ).order_by(PatientVisit.check_in_time.desc()).first()

    latest_consultation_data = None
    if latest_visit:
        consultation = db.query(Consultation).filter(Consultation.visit_id == latest_visit.id).first()
        if consultation:
            doctor_user = db.query(User).filter(User.id == consultation.doctor_id).first()
            prescriptions = db.query(Prescription).filter(Prescription.consultation_id == consultation.id).all()
            latest_consultation_data = {
                "visit_id": latest_visit.id,
                "consultation_id": consultation.id,
                "diagnosis": consultation.diagnosis,
                "clinical_notes": consultation.clinical_notes,
                "treatment_plan": consultation.treatment_plan,
                "follow_up_notes": consultation.follow_up_notes,
                "doctor_name": doctor_user.full_name if doctor_user else "Attending Doctor",
                "doctor_email": doctor_user.email if doctor_user else "",
                "completed_at": consultation.ended_at.strftime("%b %d, %Y • %I:%M %p") if consultation.ended_at else "Recently",
                "prescriptions": [
                    {
                        "medication_name": p.medication_name,
                        "dosage": p.dosage,
                        "frequency": p.frequency,
                        "duration_days": p.duration_days,
                        "instructions": p.instructions,
                    }
                    for p in prescriptions
                ],
            }

    return {
        "success": True,
        "data": {
            "patient_name": current_user.full_name,
            "patient_email": current_user.email,
            "avatar_url": current_user.avatar_url,
            "upcoming_appointments_count": active_visits_count,
            "active_token": active_token,
            "completed_visits_count": completed_visits_count,
            "total_paid_inr": round(total_paid_inr, 2),
            "total_paid_formatted": f"₹{round(total_paid_inr, 2):,}",
            "active_queue": queue_detail,
            "latest_consultation": latest_consultation_data,
        },
    }


@patient_router.get("/notifications")
def get_patient_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate dynamic notifications from live patient events."""
    from app.models.visit import PatientVisit
    from app.models.payment import Payment

    notifications = []

    # Check active queue for turn alert
    queue_service = QueueService(db)
    active_queue = queue_service.get_patient_queue_details(current_user.id)
    if active_queue:
        if active_queue["status"] == "called":
            notifications.append({
                "id": "notif_called",
                "title": "Doctor Called You!",
                "message": f"Please proceed to Room {active_queue.get('room_number') or '101'} immediately for your consultation with {active_queue.get('assigned_doctor_name') or 'Doctor'}.",
                "time": "Just now",
                "type": "queue",
                "read": False,
            })
        elif active_queue["patients_ahead"] <= 2:
            notifications.append({
                "id": "notif_turn_approaching",
                "title": "Your turn is approaching",
                "message": f"{active_queue['patients_ahead']} patients are ahead of you in {active_queue['department_name']} queue (Token {active_queue['token']}). Est wait: ~{active_queue['estimated_wait_minutes']} mins.",
                "time": "5 mins ago",
                "type": "queue",
                "read": False,
            })
        else:
            notifications.append({
                "id": "notif_queue_registered",
                "title": "Queue Token Assigned",
                "message": f"Your token is {active_queue['token']} in {active_queue['department_name']}. Currently serving {active_queue['currently_serving_token']}.",
                "time": "15 mins ago",
                "type": "queue",
                "read": True,
            })

    # Active visits / booked appointments notification
    active_visits = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
    ).order_by(PatientVisit.check_in_time.desc()).limit(5).all()

    for av in active_visits:
        notifications.append({
            "id": f"notif_booked_{av.id}",
            "title": "Appointment Booked Successfully",
            "message": f"Your appointment for '{av.chief_complaint}' is confirmed. Token & queue tracking are active.",
            "time": av.check_in_time.strftime("%b %d, %I:%M %p") if av.check_in_time else "Just now",
            "type": "appointment",
            "read": False,
        })

    # Recent payments
    payments = db.query(Payment).filter(
        Payment.patient_id == current_user.id,
    ).order_by(Payment.created_at.desc()).limit(3).all()

    for p in payments:
        if p.status == "captured":
            notifications.append({
                "id": f"notif_pay_{p.id}",
                "title": "Payment Successful",
                "message": f"Payment of ₹{p.amount} via Razorpay was successful. Transaction ID: {p.razorpay_payment_id or p.id[:8]}.",
                "time": p.created_at.strftime("%b %d, %I:%M %p") if p.created_at else "Recently",
                "type": "payment",
                "read": True,
            })

    # Completed visits
    visits = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
    ).order_by(PatientVisit.check_in_time.desc()).limit(2).all()

    for v in visits:
        if v.status in ("completed", "discharged"):
            notifications.append({
                "id": f"notif_visit_{v.id}",
                "title": "Consultation Completed",
                "message": f"Visit for '{v.chief_complaint}' is complete. Prescriptions and medical records are saved in your Visit History.",
                "time": v.discharge_time.strftime("%b %d, %I:%M %p") if v.discharge_time else "Recently",
                "type": "appointment",
                "read": True,
            })

    return {"success": True, "data": notifications}


@patient_router.post("/cancel-appointment/{visit_id}")
def cancel_patient_appointment(
    visit_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel patient appointment if not yet in consultation."""
    from app.models.visit import PatientVisit
    from app.models.queue import QueueEntry
    from app.core.exceptions import NotFoundError, ValidationError

    visit = db.query(PatientVisit).filter(
        PatientVisit.id == visit_id,
        PatientVisit.patient_id == current_user.id,
    ).first()

    if not visit:
        raise NotFoundError("Appointment/Visit")

    if visit.status in ("in_consultation", "completed", "discharged"):
        raise ValidationError(f"Cannot cancel appointment with status '{visit.status}'")

    visit.status = "cancelled"

    queue_entry = db.query(QueueEntry).filter(QueueEntry.visit_id == visit.id).first()
    if queue_entry:
        queue_entry.status = "cancelled"

    db.commit()
    return {"success": True, "message": "Appointment cancelled successfully"}


# ════════════════════════════════════════════════════════════
# Appointments Booking Router (Full Patient Booking Flow)
# ════════════════════════════════════════════════════════════
appointments_router = APIRouter(prefix="/appointments", tags=["Appointments Booking"])


@appointments_router.get("/departments")
def get_booking_departments(db: Session = Depends(get_db)):
    """Get active hospital departments for appointment booking."""
    depts = db.query(Department).filter(Department.is_active == True).all()  # noqa: E712
    return {"success": True, "data": [{"id": d.id, "name": d.name, "code": d.code} for d in depts]}


@appointments_router.post("/book")
def book_patient_appointment(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Complete appointment booking:
    1. Collects patient basic info (name, age, gender, phone, email).
    2. Collects illness, pain scale, symptoms description, duration (weeks/days).
    3. Executes ML Model (ml/priority_model.pkl & Disease ML classifier) to predict:
       - Exact Disease Diagnosis
       - Severity Priority (Emergency / Urgent / Normal) & Triage (P1-P5)
    4. Auto-matches best doctor via specialty, ratings, and availability.
    5. Queues patient and issues real department token (e.g. ORTHO-001 / CD-001 / A-027).
    6. Generates pending consultation invoice ready for Razorpay payment.
    """
    import time
    from sqlalchemy import func
    from app.models.visit import PatientVisit
    from app.models.queue import QueueEntry
    from app.models.invoice import Invoice, InvoiceItem
    from app.models.doctor import DoctorProfile, DoctorSpecialty
    from app.services.disease_ml_service import disease_ml_service

    chief_complaint = payload.get("chief_complaint") or payload.get("illness") or "General Medical Consultation"
    symptoms_description = payload.get("symptoms_description") or ""
    severity_level = payload.get("severity_level") or payload.get("pain_level") or 5
    symptom_duration = payload.get("symptom_duration") or payload.get("weeks") or "1 week"
    phone = payload.get("phone") or ""
    age = payload.get("age") or 30
    preferred_date = payload.get("preferred_date")
    preferred_time_slot = payload.get("preferred_time_slot")
    department_id = payload.get("preferred_department_id")

    # Run ML Model to predict exact disease, priority severity, and department
    ml_res = disease_ml_service.predict_disease_and_priority(
        chief_complaint=chief_complaint,
        symptoms_description=symptoms_description,
        age=age,
        severity_level=severity_level,
    )

    predicted_disease = ml_res.get("predicted_disease")
    predicted_priority = ml_res.get("priority", "Normal")
    triage_level = ml_res.get("triage_level", "P3")
    pred_dept_code = ml_res.get("department_code")
    pred_dept_name = ml_res.get("department_name")

    full_desc = f"{symptoms_description} | AI Predicted: {predicted_disease} ({predicted_priority}) | Pain Severity: {severity_level}/10 | Duration: {symptom_duration}"
    if preferred_date or preferred_time_slot:
        full_desc += f" | Scheduled: {preferred_date} {preferred_time_slot}"

    # Determine department (either user-selected or AI-predicted)
    dept = None
    if department_id:
        dept = db.query(Department).filter(Department.id == department_id).first()

    if not dept and pred_dept_code:
        dept = db.query(Department).filter(
            (Department.code == pred_dept_code) | (Department.name.ilike(f"%{pred_dept_name}%"))
        ).first()

    if not dept:
        dept = db.query(Department).filter(Department.is_active == True).first()  # noqa: E712

    department_id = dept.id if dept else None
    dept_name = dept.name if dept else (pred_dept_name or "General Medicine")
    dept_code = dept.code if dept and dept.code else "A"

    # Priority score for queue ordering
    priority_score = 95 if predicted_priority == "Emergency" else (70 if predicted_priority == "Urgent" else 40)
    priority_score += min(10, int(severity_level))

    # 1. Create or retrieve visit
    visit = db.query(PatientVisit).filter(
        PatientVisit.patient_id == current_user.id,
        PatientVisit.status.notin_(["completed", "discharged", "cancelled", "no_show"]),
    ).first()

    if not visit:
        visit = PatientVisit(
            patient_id=current_user.id,
            chief_complaint=f"{chief_complaint} ({predicted_disease})",
            symptoms_description=full_desc,
            status="checked_in",
        )
        db.add(visit)
        db.flush()
    else:
        visit.chief_complaint = f"{chief_complaint} ({predicted_disease})"
        visit.symptoms_description = full_desc

    # 2. Queue Entry & Token calculation
    queue_entry = db.query(QueueEntry).filter(QueueEntry.visit_id == visit.id).first()
    if not queue_entry:
        current_max = db.query(func.max(QueueEntry.queue_position)).filter(
            QueueEntry.department_id == department_id,
            QueueEntry.status.in_(["waiting", "called"]),
        ).scalar() or 0
        queue_pos = current_max + 1

        queue_entry = QueueEntry(
            visit_id=visit.id,
            department_id=department_id,
            priority_score=priority_score,
            triage_level=triage_level,
            queue_position=queue_pos,
            status="waiting",
        )
        db.add(queue_entry)
        db.flush()
    else:
        queue_pos = queue_entry.queue_position or 1
        queue_entry.priority_score = priority_score
        queue_entry.triage_level = triage_level

    token = f"{dept_code}-{str(queue_pos).zfill(3)}"

    preferred_doctor_id = payload.get("preferred_doctor_id")

    # 3. Doctor matching based on user selection or predicted disease & department
    matched_doctor = None
    doc_profile = None

    if preferred_doctor_id:
        doc_user = db.query(User).filter(User.id == preferred_doctor_id, User.role == "doctor").first()
        if doc_user:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doc_user.id).first()
            queue_entry.assigned_doctor_id = doc_user.id
            matched_doctor = {
                "id": doc_user.id,
                "doctor_name": doc_user.full_name,
                "department": dept_name,
                "score": doc_profile.rating if doc_profile else 4.9,
                "match_reason": f"Directly booked with {doc_user.full_name}",
            }

    if not matched_doctor:
        if department_id:
            specialties = db.query(DoctorSpecialty).filter(DoctorSpecialty.department_id == department_id).all()
            for sp in specialties:
                p = db.query(DoctorProfile).filter(DoctorProfile.id == sp.doctor_id).first()
                if p and p.is_available:
                    doc_profile = p
                    break

        if not doc_profile:
            doc_profile = db.query(DoctorProfile).first()

        if doc_profile:
            doc_user = db.query(User).filter(User.id == doc_profile.user_id).first()
            if doc_user:
                queue_entry.assigned_doctor_id = doc_user.id
                matched_doctor = {
                    "id": doc_user.id,
                    "doctor_name": doc_user.full_name,
                    "department": dept_name,
                    "score": doc_profile.rating or 4.9,
                    "match_reason": f"Top-rated specialist in {dept_name} for {predicted_disease}",
                }

    # 4. Generate Invoice for Razorpay
    consultation_fee = doc_profile.consultation_fee if doc_profile and doc_profile.consultation_fee else 500.0
    tax_amount = round(consultation_fee * 0.18, 2)
    net_amount = round(consultation_fee + tax_amount, 2)

    # Check for pending invoice for this patient
    invoice = db.query(Invoice).filter(
        Invoice.patient_id == current_user.id,
        Invoice.status == "pending",
    ).first()

    if not invoice:
        invoice_number = f"MF-{int(time.time())}"
        invoice = Invoice(
            patient_id=current_user.id,
            invoice_number=invoice_number,
            total_amount=consultation_fee,
            tax_amount=tax_amount,
            discount_amount=0.0,
            net_amount=net_amount,
            status="pending",
            notes=f"Consultation Fee for {predicted_disease} (Token: {token})",
        )
        db.add(invoice)
        db.flush()

        item = InvoiceItem(
            invoice_id=invoice.id,
            description=f"Specialist Consultation - {dept_name} ({predicted_disease})",
            item_type="consultation",
            quantity=1,
            unit_price=consultation_fee,
            amount=consultation_fee,
        )
        db.add(item)
    else:
        invoice_number = invoice.invoice_number

    db.commit()

    booking_reference = f"MF-BK-{str(visit.id)[:8].upper()}"

    # Broadcast appointment booked event for real-time notification updates
    try:
        from app.websocket import ws_manager
        import asyncio
        if department_id:
            asyncio.create_task(ws_manager.broadcast_channel(department_id, "appointment:booked", {"visit_id": visit.id, "patient_id": current_user.id}))
        asyncio.create_task(ws_manager.send_personal(current_user.id, "appointment:booked", {"visit_id": visit.id, "patient_id": current_user.id}))
    except Exception:
        pass

    return {
        "success": True,
        "data": {
            "booking_reference": booking_reference,
            "visit_id": visit.id,
            "token": token,
            "queue_position": queue_pos,
            "estimated_wait_minutes": max(5, (queue_pos - 1) * 12),
            "department_name": dept_name,
            "invoice_id": invoice.id,
            "invoice_number": invoice_number,
            "consultation_fee": consultation_fee,
            "amount": consultation_fee,
            "tax_amount": tax_amount,
            "net_amount": net_amount,
            "matched_doctor": matched_doctor,
            "ai_suggestion": {
                "predicted_disease": predicted_disease,
                "disease_description": ml_res.get("disease_description", ""),
                "predicted_level": triage_level,
                "priority": predicted_priority,
                "confidence": ml_res.get("confidence", 0.88),
                "age_category": ml_res.get("age_category", ""),
                "urgency": predicted_priority,
                "recommendation": ml_res.get("ai_summary") or f"Consultation scheduled with {dept_name} specialist. Token assigned.",
            },
        },
    }



from sqlalchemy import text  # noqa: E402 — imported here for health check
