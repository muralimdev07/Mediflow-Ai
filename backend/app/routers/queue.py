"""Queue Router — queue orchestration endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_clinical, require_staff
from app.db.session import get_db
from app.models.user import User
from app.schemas import SuccessResponse
from app.schemas.consultation import VisitCreateRequest, VisitRead
from app.schemas.queue import (
    PatientQueueDetail,
    QueueAssignDoctorRequest,
    QueueAssignRoomRequest,
    QueueCallRequest,
    QueueEntryRead,
    QueueStatsRead,
)
from app.services.queue_service import QueueService

router = APIRouter(prefix="/queue", tags=["Queue Management"])


@router.get("", response_model=SuccessResponse[list[QueueEntryRead]])
def get_active_queue(
    department_id: Optional[str] = Query(None),
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Get active queue entries. Staff only."""
    service = QueueService(db)
    if department_id:
        entries = service.get_department_queue(department_id)
    else:
        entries = service.get_active_queue()

    result = []
    for entry in entries:
        data = QueueEntryRead(
            id=entry.id,
            visit_id=entry.visit_id,
            department_id=entry.department_id,
            department_name=entry.department.name if entry.department else None,
            assigned_doctor_id=entry.assigned_doctor_id,
            assigned_doctor_name=entry.assigned_doctor.full_name if entry.assigned_doctor else None,
            room_id=entry.room_id,
            room_number=entry.room.room_number if entry.room else None,
            patient_name=entry.visit.patient.full_name if entry.visit and entry.visit.patient else None,
            chief_complaint=entry.visit.chief_complaint if entry.visit else None,
            priority_score=entry.priority_score,
            triage_level=entry.triage_level,
            queue_position=entry.queue_position,
            estimated_wait_minutes=entry.estimated_wait_minutes,
            status=entry.status,
            entered_at=entry.entered_at,
            called_at=entry.called_at,
        )
        result.append(data)

    return {"success": True, "data": result}


@router.get("/me", response_model=SuccessResponse[Optional[PatientQueueDetail]])
def get_my_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current patient's rich queue position with token and waiting time."""
    service = QueueService(db)
    details = service.get_patient_queue_details(current_user.id)
    return {"success": True, "data": details}


@router.patch("/{queue_id}/call", response_model=SuccessResponse[QueueEntryRead])
async def call_patient(
    queue_id: str,
    request: QueueCallRequest,
    current_user: User = Depends(require_clinical),
    db: Session = Depends(get_db),
):
    """Call next patient from queue."""
    service = QueueService(db)
    entry = service.call_patient(queue_id, request.room_id)
    from app.websocket import ws_manager, QueueEvents
    await ws_manager.broadcast_channel(entry.department_id, QueueEvents.CALLED, {"queue_id": entry.id})
    return {"success": True, "data": entry}


@router.patch("/{queue_id}/assign-doctor", response_model=SuccessResponse[QueueEntryRead])
async def assign_doctor(
    queue_id: str,
    request: QueueAssignDoctorRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Assign a doctor to a queue entry."""
    service = QueueService(db)
    entry = service.assign_doctor(queue_id, request.doctor_id)
    from app.websocket import ws_manager, QueueEvents
    await ws_manager.broadcast_channel(entry.department_id, QueueEvents.UPDATE, {"queue_id": entry.id})
    return {"success": True, "data": entry}


@router.patch("/{queue_id}/assign-room", response_model=SuccessResponse[QueueEntryRead])
async def assign_room(
    queue_id: str,
    request: QueueAssignRoomRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Assign a room to a queue entry."""
    service = QueueService(db)
    entry = service.assign_room(queue_id, request.room_id)
    from app.websocket import ws_manager, QueueEvents
    await ws_manager.broadcast_channel(entry.department_id, QueueEvents.ROOM_STATUS_CHANGE, {"queue_id": entry.id})
    return {"success": True, "data": entry}


@router.get("/stats/{department_id}", response_model=SuccessResponse[QueueStatsRead])
def get_queue_stats(
    department_id: str,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Get queue statistics for a department."""
    service = QueueService(db)
    stats = service.get_queue_stats(department_id)
    return {"success": True, "data": stats}
