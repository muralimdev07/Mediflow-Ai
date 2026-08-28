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
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Get patient visit/consultation history (staff only)."""
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


from sqlalchemy import text  # noqa: E402 — imported here for health check
