"""
MediFlow AI — Payment Service

Razorpay integration: order creation, signature verification, webhooks, refunds.
"""

import hashlib
import hmac
import time
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import ExternalServiceError, NotFoundError, PaymentError, ValidationError
from app.models.consultation import Consultation
from app.models.invoice import Invoice, InvoiceItem
from app.models.payment import Payment
from app.models.user import User

settings = get_settings()


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self._razorpay_client = None

    @property
    def razorpay_client(self):
        """Lazy init Razorpay client."""
        if self._razorpay_client is None:
            if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
                import razorpay
                self._razorpay_client = razorpay.Client(
                    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
                )
            else:
                self._razorpay_client = None
        return self._razorpay_client

    # ── Invoice Management ───────────────────────────────────

    def create_invoice(
        self,
        consultation_id: str,
        items: List[dict],
        discount_amount: float = 0.0,
        notes: Optional[str] = None,
    ) -> Invoice:
        """Create invoice for a completed consultation."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        # Check existing invoice
        existing = self.db.query(Invoice).filter(Invoice.consultation_id == consultation_id).first()
        if existing:
            raise ValidationError("Invoice already exists for this consultation")

        # Get patient from visit
        from app.models.visit import PatientVisit
        visit = self.db.query(PatientVisit).filter(PatientVisit.id == consultation.visit_id).first()
        if not visit:
            raise NotFoundError("Visit")

        # Generate invoice number
        invoice_number = f"MF-{int(time.time())}"

        # Calculate totals
        total_amount = sum(item["unit_price"] * item.get("quantity", 1) for item in items)
        tax_amount = round(total_amount * 0.18, 2)  # 18% GST
        net_amount = round(total_amount + tax_amount - discount_amount, 2)

        invoice = Invoice(
            consultation_id=consultation_id,
            patient_id=visit.patient_id,
            invoice_number=invoice_number,
            total_amount=total_amount,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            net_amount=net_amount,
            status="pending",
            notes=notes,
        )
        self.db.add(invoice)
        self.db.flush()

        # Add line items
        for item_data in items:
            item = InvoiceItem(
                invoice_id=invoice.id,
                description=item_data["description"],
                item_type=item_data.get("item_type", "consultation"),
                quantity=item_data.get("quantity", 1),
                unit_price=item_data["unit_price"],
                amount=item_data["unit_price"] * item_data.get("quantity", 1),
            )
            self.db.add(item)

        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def auto_generate_invoice(self, consultation_id: str) -> Invoice:
        """Auto-generate invoice from consultation fee."""
        consultation = self.db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not consultation:
            raise NotFoundError("Consultation")

        # Get doctor's consultation fee
        from app.models.doctor import DoctorProfile
        doctor_profile = self.db.query(DoctorProfile).filter(
            DoctorProfile.user_id == consultation.doctor_id
        ).first()
        fee = doctor_profile.consultation_fee if doctor_profile else 500.0

        items = [{"description": "Consultation Fee", "item_type": "consultation", "quantity": 1, "unit_price": fee}]
        return self.create_invoice(consultation_id=consultation_id, items=items)

    def get_invoice(self, invoice_id: str) -> Invoice:
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise NotFoundError("Invoice")
        return invoice

    def get_patient_invoices(self, patient_id: str) -> List[Invoice]:
        return self.db.query(Invoice).filter(
            Invoice.patient_id == patient_id,
        ).order_by(Invoice.created_at.desc()).all()

    # ── Razorpay Integration ─────────────────────────────────

    def create_razorpay_order(self, invoice_id: str) -> dict:
        """Create a Razorpay order for payment."""
        invoice = self.get_invoice(invoice_id)

        if invoice.status == "paid":
            raise ValidationError("Invoice is already paid")

        amount_paise = int(invoice.net_amount * 100)  # Convert to paise

        if self.razorpay_client:
            try:
                order = self.razorpay_client.order.create({
                    "amount": amount_paise,
                    "currency": invoice.currency,
                    "receipt": invoice.invoice_number,
                    "notes": {
                        "invoice_id": invoice.id,
                        "patient_id": invoice.patient_id,
                    },
                })
                razorpay_order_id = order["id"]
            except Exception as e:
                raise ExternalServiceError("Razorpay", str(e))
        else:
            # Mock order for development
            razorpay_order_id = f"order_mock_{int(time.time())}"

        # Create payment record
        payment = Payment(
            invoice_id=invoice.id,
            patient_id=invoice.patient_id,
            razorpay_order_id=razorpay_order_id,
            amount=invoice.net_amount,
            currency=invoice.currency,
            status="created",
        )
        self.db.add(payment)
        self.db.commit()

        patient = self.db.query(User).filter(User.id == invoice.patient_id).first()

        return {
            "order_id": razorpay_order_id,
            "amount": amount_paise,
            "currency": invoice.currency,
            "key_id": settings.RAZORPAY_KEY_ID,
            "invoice_number": invoice.invoice_number,
            "patient_name": patient.full_name if patient else "",
            "patient_email": patient.email if patient else "",
            "description": f"MediFlow AI - Invoice {invoice.invoice_number}",
        }

    def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> Payment:
        """Verify Razorpay payment signature and update status."""
        payment = self.db.query(Payment).filter(
            Payment.razorpay_order_id == razorpay_order_id
        ).first()
        if not payment:
            raise NotFoundError("Payment")

        # Verify signature
        if self.razorpay_client and settings.RAZORPAY_KEY_SECRET:
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256,
            ).hexdigest()

            if expected_signature != razorpay_signature:
                payment.status = "failed"
                self.db.commit()
                raise PaymentError("Payment signature verification failed")

        # Update payment
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = "captured"

        # Update invoice
        invoice = self.db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if invoice:
            invoice.status = "paid"
            invoice.paid_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(payment)
        return payment

    def handle_webhook(self, payload: dict, signature: str) -> bool:
        """Handle Razorpay webhook events."""
        # Verify webhook signature
        if settings.RAZORPAY_WEBHOOK_SECRET:
            expected = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                str(payload).encode(),
                hashlib.sha256,
            ).hexdigest()
            if expected != signature:
                return False

        event = payload.get("event", "")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})

        if event == "payment.captured":
            order_id = payment_entity.get("order_id")
            payment = self.db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            if payment and payment.status != "captured":
                payment.status = "captured"
                payment.razorpay_payment_id = payment_entity.get("id")
                payment.method = payment_entity.get("method")
                payment.razorpay_response = payment_entity

                invoice = self.db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
                if invoice:
                    invoice.status = "paid"
                    invoice.paid_at = datetime.now(timezone.utc)

                self.db.commit()

        elif event == "payment.failed":
            order_id = payment_entity.get("order_id")
            payment = self.db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            if payment:
                payment.status = "failed"
                payment.razorpay_response = payment_entity
                self.db.commit()

        return True

    def initiate_refund(self, payment_id: str, amount: Optional[float] = None) -> Payment:
        """Initiate a refund for a payment."""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundError("Payment")

        if payment.status != "captured":
            raise ValidationError("Can only refund captured payments")

        refund_amount = amount or payment.amount

        if self.razorpay_client and payment.razorpay_payment_id:
            try:
                refund = self.razorpay_client.payment.refund(
                    payment.razorpay_payment_id,
                    {"amount": int(refund_amount * 100)},
                )
                payment.refund_id = refund.get("id")
            except Exception as e:
                raise ExternalServiceError("Razorpay", f"Refund failed: {str(e)}")

        payment.status = "refunded"
        payment.refund_amount = refund_amount

        # Update invoice
        invoice = self.db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        if invoice:
            invoice.status = "refunded"

        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_patient_payments(self, patient_id: str) -> List[Payment]:
        return self.db.query(Payment).filter(
            Payment.patient_id == patient_id,
        ).order_by(Payment.created_at.desc()).all()

    def get_payment(self, payment_id: str) -> Payment:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundError("Payment")
        return payment
