"""Invoice and InvoiceItem Models — billing after consultation."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    consultation_id = Column(String(36), ForeignKey("consultations.id", ondelete="SET NULL"), unique=True, nullable=True)
    patient_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    net_amount = Column(Float, default=0.0, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    status = Column(
        Enum("draft", "pending", "paid", "partially_paid", "overdue", "cancelled", "refunded", name="invoice_status_enum"),
        default="pending",
        nullable=False,
        index=True,
    )
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    consultation = relationship("Consultation", back_populates="invoice")
    patient = relationship("User", foreign_keys=[patient_id])
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Invoice {self.invoice_number} ₹{self.net_amount} ({self.status})>"


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(500), nullable=False)
    item_type = Column(
        Enum("consultation", "procedure", "medication", "lab_test", "other", name="invoice_item_type_enum"),
        default="consultation",
        nullable=False,
    )
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="items")

    def __repr__(self):
        return f"<InvoiceItem {self.description} ₹{self.amount}>"
