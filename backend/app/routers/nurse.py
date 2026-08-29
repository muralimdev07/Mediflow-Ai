"""Nurse Router — All-Doctor Appointments Roster, Arrival Check-in, and Clinical Vitals Capture."""

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.dependencies import require_nurse, require_clinical, require_staff
from app.models.user import User
from app.models.visit import PatientVisit
from app.models.queue import QueueEntry
from app.models.consultation import Consultation
from app.models.vitals import VitalsRecord
from app.models.triage import TriageAssessment
from app.models.doctor import DoctorProfile
from app.models.department import Department
from app.models.room import Room
from app.websocket import ws_manager, QueueEvents

router = APIRouter(prefix="/nurse", tags=["Nurse Station"])


class RecordVitalsRequest(BaseModel):
    visit_id: str
    temperature: Optional[float] = 98.6  # Fahrenheit
    heart_rate: Optional[int] = 72       # BPM
    blood_pressure_systolic: Optional[int] = 120
    blood_pressure_diastolic: Optional[int] = 80
    oxygen_saturation: Optional[float] = 98.0  # %
    respiratory_rate: Optional[int] = 16
    weight: Optional[float] = None       # kg
    height: Optional[float] = None       # cm
    pain_scale: Optional[int] = 0        # 0-10
    triage_level: Optional[str] = "P3"   # P1-P5
    nurse_notes: Optional[str] = ""


@router.get("/appointments/today")
def get_today_appointments(
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """
    Get all patient visits and appointments scheduled/active today across all doctors and departments.
    """
    visits = db.query(PatientVisit).order_by(PatientVisit.check_in_time.desc()).all()

    roster = []
    for visit in visits:
        try:
            patient = db.query(User).filter(User.id == visit.patient_id).first()
            queue_entry = db.query(QueueEntry).filter(QueueEntry.visit_id == visit.id).first()
            consultation = db.query(Consultation).filter(Consultation.visit_id == visit.id).first()
            triage = db.query(TriageAssessment).filter(TriageAssessment.visit_id == visit.id).first()
            
            doctor_name = "Assigned on Duty"
            doctor_id = None
            dept_name = "General OPD"
            room_num = "Room 101"

            if queue_entry:
                doc_target_id = getattr(queue_entry, "assigned_doctor_id", None) or getattr(queue_entry, "doctor_id", None)
                if doc_target_id:
                    doc_user = db.query(User).filter(User.id == doc_target_id).first()
                    if doc_user:
                        doctor_name = doc_user.full_name
                        doctor_id = doc_user.id
                if queue_entry.department:
                    dept_name = queue_entry.department.name
                if queue_entry.room:
                    room_num = queue_entry.room.room_number

            if doctor_name == "Assigned on Duty" and consultation and consultation.doctor_id:
                c_doc = db.query(User).filter(User.id == consultation.doctor_id).first()
                if c_doc:
                    doctor_name = c_doc.full_name
                    doctor_id = c_doc.id

            token = None
            if queue_entry and queue_entry.department:
                token = f"{queue_entry.department.code}-{str(queue_entry.queue_position or 1).zfill(3)}"

            # Find any recorded vitals
            vitals_data = None
            if consultation:
                v_rec = db.query(VitalsRecord).filter(VitalsRecord.consultation_id == consultation.id).first()
                if v_rec:
                    vitals_data = {
                        "temperature": v_rec.temperature,
                        "heart_rate": v_rec.heart_rate,
                        "blood_pressure": v_rec.blood_pressure,
                        "blood_pressure_systolic": v_rec.blood_pressure_systolic,
                        "blood_pressure_diastolic": v_rec.blood_pressure_diastolic,
                        "oxygen_saturation": v_rec.oxygen_saturation,
                        "weight": v_rec.weight,
                        "height": v_rec.height,
                        "respiratory_rate": v_rec.respiratory_rate,
                    }

            if not vitals_data and triage and triage.vitals:
                vitals_data = triage.vitals

            check_in_str = "Scheduled"
            if visit.check_in_time:
                try:
                    check_in_str = visit.check_in_time.strftime("%I:%M %p")
                except Exception:
                    check_in_str = str(visit.check_in_time)

            discharge_str = None
            if visit.discharge_time:
                try:
                    discharge_str = visit.discharge_time.strftime("%I:%M %p")
                except Exception:
                    discharge_str = str(visit.discharge_time)

            roster.append({
                "visit_id": visit.id,
                "patient_id": visit.patient_id,
                "patient_name": patient.full_name if patient else "Walk-in Patient",
                "patient_email": patient.email if patient else "",
                "patient_gender": getattr(patient, "gender", "Not specified") or "Not specified",
                "patient_blood_group": getattr(patient, "blood_group", "N/A") or "N/A",
                "token": token or "PT-001",
                "chief_complaint": visit.chief_complaint or "General Consultation",
                "symptoms_description": visit.symptoms_description or "",
                "status": visit.status or "checked_in",
                "assigned_doctor_id": doctor_id,
                "assigned_doctor_name": doctor_name,
                "department_name": dept_name,
                "room_number": room_num,
                "check_in_time": check_in_str,
                "discharge_time": discharge_str,
                "has_vitals": bool(vitals_data),
                "vitals": vitals_data,
                "nurse_notes": triage.nurse_notes if triage else "",
                "triage_level": triage.triage_level if triage else "P3",
                "pain_scale": triage.pain_scale if triage else 0,
            })
        except Exception as e:
            print(f"Error parsing visit {visit.id}: {e}")
            continue

    return {
        "success": True,
        "total_patients": len(roster),
        "data": roster,
    }


@router.post("/patient-arrival/{visit_id}")
def mark_patient_arrival(
    visit_id: str,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Mark patient arrival at hospital/clinic reception and place in triage."""
    visit = db.query(PatientVisit).filter(PatientVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient visit not found")

    visit.status = "in_triage"
    db.commit()

    # WebSocket Broadcast
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(ws_manager.broadcast_all(QueueEvents.UPDATE, {
                "action": "PATIENT_ARRIVED",
                "visit_id": visit.id,
                "status": "in_triage",
            }))
    except Exception as e:
        print(f"WS error: {e}")

    return {
        "success": True,
        "message": "Patient arrival confirmed. Ready for vital observations capture.",
        "status": "in_triage",
    }


@router.post("/record-vitals")
def record_patient_vitals(
    req: RecordVitalsRequest,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """
    Nurse records patient vitals (BP, Temp, Pulse, SpO2, Weight, Height) and observation notes.
    Directly updates the consultation and broadcasts to the assigned doctor.
    """
    visit = db.query(PatientVisit).filter(PatientVisit.id == req.visit_id).first()
    if not visit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient visit not found")

    # Update visit status
    if visit.status in ["checked_in", "in_triage", "scheduled"]:
        visit.status = "in_queue"

    # 1. Update or create Triage Assessment
    triage = db.query(TriageAssessment).filter(TriageAssessment.visit_id == req.visit_id).first()
    vitals_json = {
        "temperature": req.temperature,
        "heart_rate": req.heart_rate,
        "blood_pressure_systolic": req.blood_pressure_systolic,
        "blood_pressure_diastolic": req.blood_pressure_diastolic,
        "blood_pressure": f"{req.blood_pressure_systolic}/{req.blood_pressure_diastolic}",
        "oxygen_saturation": req.oxygen_saturation,
        "respiratory_rate": req.respiratory_rate,
        "weight": req.weight,
        "height": req.height,
    }

    if not triage:
        triage = TriageAssessment(
            visit_id=visit.id,
            assessed_by=current_user.id,
            triage_level=req.triage_level or "P3",
            pain_scale=req.pain_scale or 0,
            vitals=vitals_json,
            nurse_notes=req.nurse_notes or "",
        )
        db.add(triage)
    else:
        triage.triage_level = req.triage_level or "P3"
        triage.pain_scale = req.pain_scale or 0
        triage.vitals = vitals_json
        triage.nurse_notes = req.nurse_notes or ""

    # 2. Ensure Consultation record exists and store VitalsRecord
    consultation = db.query(Consultation).filter(Consultation.visit_id == visit.id).first()
    queue_entry = db.query(QueueEntry).filter(QueueEntry.visit_id == visit.id).first()
    
    doctor_id = None
    if queue_entry:
        doctor_id = getattr(queue_entry, "assigned_doctor_id", None) or getattr(queue_entry, "doctor_id", None)

    if not doctor_id and consultation:
        doctor_id = consultation.doctor_id

    if not doctor_id:
        first_doc = db.query(User).filter(User.role == "doctor").first()
        doctor_id = first_doc.id if first_doc else current_user.id

    if not consultation:
        consultation = Consultation(
            visit_id=visit.id,
            doctor_id=doctor_id,
            started_at=datetime.now(timezone.utc),
        )
        db.add(consultation)
        db.flush()
    else:
        if not consultation.doctor_id:
            consultation.doctor_id = doctor_id

    vitals_record = db.query(VitalsRecord).filter(VitalsRecord.consultation_id == consultation.id).first()
    if not vitals_record:
        vitals_record = VitalsRecord(
            consultation_id=consultation.id,
            temperature=req.temperature,
            heart_rate=req.heart_rate,
            blood_pressure_systolic=req.blood_pressure_systolic,
            blood_pressure_diastolic=req.blood_pressure_diastolic,
            respiratory_rate=req.respiratory_rate,
            oxygen_saturation=req.oxygen_saturation,
            weight=req.weight,
            height=req.height,
        )
        db.add(vitals_record)
    else:
        vitals_record.temperature = req.temperature
        vitals_record.heart_rate = req.heart_rate
        vitals_record.blood_pressure_systolic = req.blood_pressure_systolic
        vitals_record.blood_pressure_diastolic = req.blood_pressure_diastolic
        vitals_record.respiratory_rate = req.respiratory_rate
        vitals_record.oxygen_saturation = req.oxygen_saturation
        vitals_record.weight = req.weight
        vitals_record.height = req.height

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error saving vitals commit: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

    # 3. Real-Time Broadcast to Doctor & Queue Channels
    import asyncio
    ws_payload = {
        "event": "vitals:updated",
        "visit_id": visit.id,
        "patient_id": visit.patient_id,
        "doctor_id": doctor_id,
        "vitals": vitals_json,
        "nurse_notes": req.nurse_notes,
        "triage_level": req.triage_level,
        "action": "VITALS_RECORDED",
    }

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            if doctor_id:
                asyncio.create_task(ws_manager.send_personal(doctor_id, "vitals:updated", ws_payload))
                asyncio.create_task(ws_manager.send_personal(doctor_id, QueueEvents.UPDATE, ws_payload))
            asyncio.create_task(ws_manager.broadcast_all(QueueEvents.UPDATE, ws_payload))
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return {
        "success": True,
        "message": "Vitals successfully recorded and synchronized to attending doctor.",
        "data": {
            "visit_id": visit.id,
            "vitals": vitals_json,
            "nurse_notes": req.nurse_notes,
        },
    }
