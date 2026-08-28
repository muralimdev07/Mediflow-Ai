"""Payment Model — Razorpay payment tracking."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship

from app.db import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_id = Column(String(36), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    razorpay_order_id = Column(String(100), unique=True, nullable=True)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    razorpay_signature = Column(String(500), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    status = Column(
        Enum("created", "authorized", "captured", "failed", "refunded", "refund_pending", name="payment_status_enum"),
        default="created",
        nullable=False,
        index=True,
    )
    method = Column(String(50), nullable=True)  # upi, card, netbanking, wallet
    razorpay_response = Column(JSON, nullable=True)  # Full Razorpay response for audit
    refund_id = Column(String(100), nullable=True)
    refund_amount = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    patient = relationship("User", foreign_keys=[patient_id])

    def __repr__(self):
        return f"<Payment ₹{self.amount} ({self.status}) order={self.razorpay_order_id}>"
