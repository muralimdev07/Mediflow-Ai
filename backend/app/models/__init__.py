"""Models package — import all models so Alembic can discover them."""

from app.models.user import User  # noqa: F401
from app.models.patient import PatientProfile  # noqa: F401
from app.models.doctor import DoctorProfile, DoctorSpecialty, DoctorSchedule  # noqa: F401
from app.models.nurse import NurseProfile  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.room import Room  # noqa: F401
from app.models.visit import PatientVisit  # noqa: F401
from app.models.queue import QueueEntry  # noqa: F401
from app.models.triage import TriageAssessment, AiTriageResult  # noqa: F401
from app.models.consultation import Consultation  # noqa: F401
from app.models.prescription import Prescription  # noqa: F401
from app.models.vitals import VitalsRecord  # noqa: F401
from app.models.invoice import Invoice, InvoiceItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.session import UserSession  # noqa: F401
from app.models.invitation import Invitation  # noqa: F401
