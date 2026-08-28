"""Payment Schemas — Razorpay integration."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    """Request to create a Razorpay order for an invoice."""
    invoice_id: str


class CreateOrderResponse(BaseModel):
    """Razorpay order details for frontend checkout."""
    order_id: str
    amount: int  # Amount in paise (smallest currency unit)
    currency: str
    key_id: str  # Razorpay key_id (safe to expose)
    invoice_number: str
    patient_name: str
    patient_email: str
    description: str


class VerifyPaymentRequest(BaseModel):
    """Payment verification after Razorpay checkout."""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentRead(BaseModel):
    id: str
    invoice_id: str
    invoice_number: Optional[str] = None
    patient_id: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    method: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvoiceCreateRequest(BaseModel):
    """Create invoice for a consultation."""
    consultation_id: str
    items: List["InvoiceItemCreate"]
    discount_amount: float = 0.0
    notes: Optional[str] = None


class InvoiceItemCreate(BaseModel):
    description: str
    item_type: str = "consultation"
    quantity: int = 1
    unit_price: float


class InvoiceRead(BaseModel):
    id: str
    consultation_id: Optional[str] = None
    patient_id: str
    patient_name: Optional[str] = None
    invoice_number: str
    total_amount: float
    tax_amount: float
    discount_amount: float
    net_amount: float
    currency: str
    status: str
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    items: List["InvoiceItemRead"] = []
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceItemRead(BaseModel):
    id: str
    description: str
    item_type: str
    quantity: int
    unit_price: float
    amount: float

    class Config:
        from_attributes = True


class RefundRequest(BaseModel):
    amount: Optional[float] = None  # None = full refund
    reason: Optional[str] = None


# Resolve forward refs
InvoiceCreateRequest.model_rebuild()
InvoiceRead.model_rebuild()
