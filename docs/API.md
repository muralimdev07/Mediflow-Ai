# MediFlow AI — API Reference Specification

All endpoints are prefixed with `/api/v1`. Open interactive Swagger documentation at `http://localhost:8000/docs`.

## Authentication & Users

### `POST /api/v1/auth/google`
Authenticates user with Google OAuth authorization code.
- **Request Body**: `{ "code": "string", "redirect_uri": "string" }`
- **Response**: JWT access token, refresh token, and user brief profile.

### `POST /api/v1/auth/refresh`
Refreshes access token.
- **Request Body**: `{ "refresh_token": "string" }`

### `GET /api/v1/users/me`
Fetches authenticated user details.

### `POST /api/v1/users/invite` [Admin Only]
Invites staff member via email.
- **Request Body**: `{ "email": "user@mediflow.ai", "role": "doctor" }`

---

## Visits & Queue Management

### `POST /api/v1/visits` [Patient]
Patient check-in with chief complaint & symptoms.
- **Request Body**: `{ "chief_complaint": "Chest pain", "symptoms_description": "2 hours duration" }`

### `GET /api/v1/queue` [Staff]
Retrieves active queue entries sorted by priority score.

### `GET /api/v1/queue/me` [Patient]
Retrieves current patient's position and estimated wait time.

### `PATCH /api/v1/queue/{id}/call` [Doctor/Nurse]
Calls patient from queue to assigned room.

### `PATCH /api/v1/queue/{id}/assign-room` [Staff]
Assigns an available room to a queue entry.

---

## Triage & Doctor Matching

### `POST /api/v1/triage/{visit_id}` [Nurse/Doctor]
Submits nurse triage assessment & vitals.
- **Request Body**: `{ "triage_level": "P2", "pain_scale": 8, "vitals": { "temperature": 98.6, "heart_rate": 110 } }`

### `GET /api/v1/triage/{visit_id}/ai` [Clinical]
Gets AI XGBoost triage prediction with top feature importances and confidence score.

### `GET /api/v1/matching/{visit_id}` [Staff]
Gets ranked list of matched doctors based on specialty, workload, rating, and schedule.

---

## Consultations

### `POST /api/v1/consultations` [Doctor]
Starts consultation for a visit.

### `PATCH /api/v1/consultations/{id}` [Doctor]
Updates diagnosis, clinical notes, and treatment plan.

### `POST /api/v1/consultations/{id}/prescriptions` [Doctor]
Adds prescription medication item.

### `POST /api/v1/consultations/{id}/complete` [Doctor]
Completes consultation, discharges patient, and triggers auto-invoice generation.

---

## Payments & Invoices (Razorpay)

### `POST /api/v1/payments/create-order`
Creates Razorpay order for an invoice.
- **Request Body**: `{ "invoice_id": "string" }`
- **Response**: `{ "order_id": "string", "amount": 58000, "key_id": "rzp_test_xxx" }`

### `POST /api/v1/payments/verify`
Verifies Razorpay HMAC SHA256 payment signature.
- **Request Body**: `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }`

### `POST /api/v1/payments/webhook`
Asynchronous Razorpay webhook receiver (`payment.captured`, `payment.failed`).
