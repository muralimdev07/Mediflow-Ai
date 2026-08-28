"""Initial schema - all MediFlow AI tables

Revision ID: 001_initial
Revises: None
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enum types
    user_role_enum = sa.Enum("patient", "nurse", "doctor", "admin", "super_admin", "pending", name="user_role")
    user_role_enum.create(op.get_bind(), checkfirst=True)

    visit_status_enum = sa.Enum(
        "checked_in", "in_queue", "called", "triaged", "in_consultation",
        "completed", "discharged", "cancelled", "no_show",
        name="visit_status",
    )
    visit_status_enum.create(op.get_bind(), checkfirst=True)

    queue_status_enum = sa.Enum("waiting", "called", "in_progress", "completed", "skipped", name="queue_status")
    queue_status_enum.create(op.get_bind(), checkfirst=True)

    triage_level_enum = sa.Enum("P1", "P2", "P3", "P4", "P5", name="triage_level")
    triage_level_enum.create(op.get_bind(), checkfirst=True)

    room_type_enum = sa.Enum("consultation", "examination", "emergency", "procedure", name="room_type")
    room_type_enum.create(op.get_bind(), checkfirst=True)

    room_status_enum = sa.Enum("available", "occupied", "maintenance", name="room_status_type")
    room_status_enum.create(op.get_bind(), checkfirst=True)

    invoice_status_enum = sa.Enum("pending", "paid", "partially_paid", "refunded", "cancelled", name="invoice_status")
    invoice_status_enum.create(op.get_bind(), checkfirst=True)

    invoice_item_type_enum = sa.Enum("consultation", "lab", "procedure", "medication", "other", name="invoice_item_type")
    invoice_item_type_enum.create(op.get_bind(), checkfirst=True)

    payment_status_enum = sa.Enum("created", "authorized", "captured", "failed", "refunded", name="payment_status")
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    payment_method_enum = sa.Enum("upi", "card", "netbanking", "wallet", "other", name="payment_method")
    payment_method_enum.create(op.get_bind(), checkfirst=True)

    # ── Users ────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("google_id", sa.String(255), unique=True, nullable=True, index=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("role", user_role_enum, nullable=False, server_default="pending"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Patient Profiles ─────────────────────────────────────
    op.create_table(
        "patient_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("date_of_birth", sa.Date, nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("blood_group", sa.String(5), nullable=True),
        sa.Column("allergies", sa.Text, nullable=True),
        sa.Column("medical_history", sa.Text, nullable=True),
        sa.Column("emergency_contact", sa.String(100), nullable=True),
    )

    # ── Doctor Profiles ──────────────────────────────────────
    op.create_table(
        "doctor_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("license_number", sa.String(100), nullable=True),
        sa.Column("experience_years", sa.Integer, nullable=True),
        sa.Column("rating", sa.Float, nullable=True, server_default=sa.text("0.0")),
        sa.Column("total_consultations", sa.Integer, nullable=True, server_default=sa.text("0")),
        sa.Column("consultation_fee", sa.Float, nullable=True, server_default=sa.text("500.0")),
        sa.Column("is_available", sa.Boolean, nullable=False, server_default=sa.text("1")),
    )

    # ── Nurse Profiles ───────────────────────────────────────
    op.create_table(
        "nurse_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("employee_id", sa.String(50), nullable=True),
        sa.Column("department_assignment", sa.String(100), nullable=True),
    )

    # ── Departments ──────────────────────────────────────────
    op.create_table(
        "departments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("code", sa.String(20), nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("1")),
    )

    # ── Doctor Specialties ───────────────────────────────────
    op.create_table(
        "doctor_specialties",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("doctor_id", sa.String(36), sa.ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("department_id", sa.String(36), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("is_primary", sa.Boolean, nullable=False, server_default=sa.text("0")),
    )

    # ── Doctor Schedules ─────────────────────────────────────
    op.create_table(
        "doctor_schedules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("doctor_id", sa.String(36), sa.ForeignKey("doctor_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_of_week", sa.Integer, nullable=False),
        sa.Column("start_time", sa.String(5), nullable=False),
        sa.Column("end_time", sa.String(5), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("1")),
    )

    # ── Rooms ────────────────────────────────────────────────
    op.create_table(
        "rooms",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("department_id", sa.String(36), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("room_number", sa.String(20), nullable=False),
        sa.Column("room_type", room_type_enum, nullable=False, server_default="consultation"),
        sa.Column("status", room_status_enum, nullable=False, server_default="available"),
    )

    # ── Patient Visits ───────────────────────────────────────
    op.create_table(
        "patient_visits",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("chief_complaint", sa.String(500), nullable=False),
        sa.Column("symptoms_description", sa.Text, nullable=True),
        sa.Column("status", visit_status_enum, nullable=False, server_default="checked_in"),
        sa.Column("check_in_time", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("discharge_time", sa.DateTime, nullable=True),
    )

    # ── Queue Entries ────────────────────────────────────────
    op.create_table(
        "queue_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("visit_id", sa.String(36), sa.ForeignKey("patient_visits.id", ondelete="CASCADE"), nullable=False),
        sa.Column("department_id", sa.String(36), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("assigned_doctor_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("room_id", sa.String(36), sa.ForeignKey("rooms.id"), nullable=True),
        sa.Column("priority_score", sa.Integer, nullable=False, server_default=sa.text("50")),
        sa.Column("triage_level", triage_level_enum, nullable=False, server_default="P5"),
        sa.Column("queue_position", sa.Integer, nullable=True),
        sa.Column("estimated_wait_minutes", sa.Integer, nullable=True),
        sa.Column("status", queue_status_enum, nullable=False, server_default="waiting"),
        sa.Column("entered_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("called_at", sa.DateTime, nullable=True),
        sa.Column("completed_at", sa.DateTime, nullable=True),
    )

    # ── Triage Assessments ───────────────────────────────────
    op.create_table(
        "triage_assessments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("visit_id", sa.String(36), sa.ForeignKey("patient_visits.id"), nullable=False),
        sa.Column("assessed_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("triage_level", triage_level_enum, nullable=False),
        sa.Column("pain_scale", sa.Integer, nullable=True),
        sa.Column("vitals", sa.JSON, nullable=True),
        sa.Column("nurse_notes", sa.Text, nullable=True),
        sa.Column("assessed_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── AI Triage Results ────────────────────────────────────
    op.create_table(
        "ai_triage_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("triage_id", sa.String(36), sa.ForeignKey("triage_assessments.id"), nullable=False),
        sa.Column("predicted_level", triage_level_enum, nullable=False),
        sa.Column("confidence_score", sa.Float, nullable=False),
        sa.Column("feature_importances", sa.JSON, nullable=True),
        sa.Column("shap_values", sa.JSON, nullable=True),
        sa.Column("model_version", sa.String(50), nullable=True),
        sa.Column("predicted_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Consultations ────────────────────────────────────────
    op.create_table(
        "consultations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("visit_id", sa.String(36), sa.ForeignKey("patient_visits.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("doctor_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("diagnosis", sa.Text, nullable=True),
        sa.Column("clinical_notes", sa.Text, nullable=True),
        sa.Column("treatment_plan", sa.Text, nullable=True),
        sa.Column("follow_up_notes", sa.Text, nullable=True),
        sa.Column("started_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("ended_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Prescriptions ────────────────────────────────────────
    op.create_table(
        "prescriptions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("consultation_id", sa.String(36), sa.ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("medication_name", sa.String(255), nullable=False),
        sa.Column("dosage", sa.String(100), nullable=False),
        sa.Column("frequency", sa.String(100), nullable=False),
        sa.Column("duration_days", sa.Integer, nullable=True),
        sa.Column("instructions", sa.Text, nullable=True),
    )

    # ── Vitals Records ───────────────────────────────────────
    op.create_table(
        "vitals_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("consultation_id", sa.String(36), sa.ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("temperature", sa.Float, nullable=True),
        sa.Column("heart_rate", sa.Integer, nullable=True),
        sa.Column("blood_pressure", sa.String(20), nullable=True),
        sa.Column("respiratory_rate", sa.Integer, nullable=True),
        sa.Column("oxygen_saturation", sa.Float, nullable=True),
        sa.Column("weight", sa.Float, nullable=True),
        sa.Column("height", sa.Float, nullable=True),
        sa.Column("recorded_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Invoices ─────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("consultation_id", sa.String(36), sa.ForeignKey("consultations.id"), nullable=False),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("invoice_number", sa.String(50), unique=True, nullable=False),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("discount_amount", sa.Numeric(10, 2), nullable=False, server_default=sa.text("0.00")),
        sa.Column("net_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("status", invoice_status_enum, nullable=False, server_default="pending"),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("due_date", sa.DateTime, nullable=True),
        sa.Column("paid_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Invoice Items ────────────────────────────────────────
    op.create_table(
        "invoice_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("invoice_id", sa.String(36), sa.ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.String(255), nullable=False),
        sa.Column("item_type", invoice_item_type_enum, nullable=False, server_default="consultation"),
        sa.Column("quantity", sa.Numeric(10, 2), nullable=False, server_default=sa.text("1")),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
    )

    # ── Payments ─────────────────────────────────────────────
    op.create_table(
        "payments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("invoice_id", sa.String(36), sa.ForeignKey("invoices.id"), nullable=False),
        sa.Column("patient_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("razorpay_order_id", sa.String(100), unique=True, nullable=True),
        sa.Column("razorpay_payment_id", sa.String(100), unique=True, nullable=True),
        sa.Column("razorpay_signature", sa.String(255), nullable=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("status", payment_status_enum, nullable=False, server_default="created"),
        sa.Column("method", payment_method_enum, nullable=True),
        sa.Column("refund_id", sa.String(100), nullable=True),
        sa.Column("refund_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("razorpay_response", sa.JSON, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── User Sessions ────────────────────────────────────────
    op.create_table(
        "user_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("token", sa.String(500), nullable=False),
        sa.Column("refresh_token", sa.String(500), nullable=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # ── Invitations ──────────────────────────────────────────
    op.create_table(
        "invitations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("invited_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("token", sa.String(255), nullable=True),
        sa.Column("expires_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("invitations")
    op.drop_table("user_sessions")
    op.drop_table("payments")
    op.drop_table("invoice_items")
    op.drop_table("invoices")
    op.drop_table("vitals_records")
    op.drop_table("prescriptions")
    op.drop_table("consultations")
    op.drop_table("ai_triage_results")
    op.drop_table("triage_assessments")
    op.drop_table("queue_entries")
    op.drop_table("patient_visits")
    op.drop_table("rooms")
    op.drop_table("doctor_schedules")
    op.drop_table("doctor_specialties")
    op.drop_table("departments")
    op.drop_table("nurse_profiles")
    op.drop_table("doctor_profiles")
    op.drop_table("patient_profiles")
    op.drop_table("users")

    # Drop enum types
    for enum_name in [
        "payment_method", "payment_status", "invoice_item_type",
        "invoice_status", "room_status_type", "room_type",
        "triage_level", "queue_status", "visit_status", "user_role",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
