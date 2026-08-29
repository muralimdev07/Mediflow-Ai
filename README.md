# 🏥 MediFlow AI — Next-Generation Intelligent Hospital Queue & Patient Orchestration Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.109-009688.svg?logo=fastapi)]()
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg?logo=react)]()
[![Machine Learning](https://img.shields.io/badge/ML-Random%20Forest%20Classifier-FF6F00.svg?logo=scikitlearn)]()
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20HMAC--SHA256-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

> **MediFlow AI** is a comprehensive, enterprise-grade clinical workflow and hospital management ecosystem that eliminates waiting room chaos, automates emergency triage with machine learning, and seamlessly connects Patients, Triage Nurses, Doctors, and Administrators in real-time.

---

## 🌟 Key Highlights & Core Features

### 1. 🤖 AI-Powered Emergency Triage & Urgency Prioritization
* **Machine Learning Engine**: Powered by an ensemble `Random Forest Classifier` (200 decision trees) trained on clinical datasets.
* **8-Factor Vitals Assessment**: Analyzes Age, Heart Rate (BPM), Systolic & Diastolic Blood Pressure, Body Temperature (°C), Oxygen Saturation (SpO2 %), Ahead Queue Count, and Elapsed Waiting Time.
* **Dynamic Urgency Levels**: Predicts triage classifications from **P1 (Emergency / Resuscitation)** to **P5 (Non-Urgent Routine Checkup)** to prioritize critical patients instantly.

### 2. 👩‍⚕️ Dedicated Nurse Triage Station (`/nurse/login`)
* **Real-time Today's Appointment Roster**: View all patients scheduled across all hospital departments.
* **Patient Arrival & Check-In**: One-click arrival confirmation upon patient reaching the hospital.
* **Live Vitals & Observations Recording**: Fast clinical input for Blood Pressure, Temperature, Pulse, SpO2, Weight, and Nurse Triage notes.
* **Direct Doctor Sync**: Captured vitals immediately reflect in the assigned doctor's consultation queue with triage color flags.

### 3. 👨‍⚕️ Intelligent Doctor Consultation Desk (`/login`)
* **Dynamic Patient Queue**: Live queue list with caller system (`Call Patient`, `In Progress`, `Complete`).
* **Complete Clinical History & Vitals Banner**: Direct visibility into nurse-recorded vitals, past diagnoses, previous prescriptions, and consultation history.
* **Digital Prescription Studio**: Fast medicine search, dosage timing (`Morn-Aft-Night`), food instructions, follow-up scheduling, and instant PDF/Digital report issuance.
* **Consultation Analytics**: Tracks daily patient count, consultation turnaround time, and revenue breakdown.

### 4. 👤 Interactive Patient Portal
* **Smart Specialist Finder**: Interactive orbital specialist explorer matching patients to 8+ clinical specialties.
* **AI Symptom Analyzer**: Automated questionnaire helping patients identify appropriate departments.
* **Live Token & Real-time Queue Tracking**: Digital token monitoring with estimated wait time and live notifications.
* **Razorpay Payment Gateway**: Seamless online consultation payment via UPI, Cards, and Net Banking with 256-bit HMAC-SHA256 signature verification.

### 5. 🏢 Enterprise Hospital Administration
* Department-wise doctor scheduling and room management.
* Revenue and billing reconciliation.
* Real-time hospital occupancy, bed allocation, and pharmacy dispatch logs.

---

## 🏗️ Architecture & System Design

```
                     ┌────────────────────────────────────────────────────────┐
                     │                   MediFlow AI Client                   │
                     │          (React 18 + Vite + Tailwind + Lucide)         │
                     └───────────────────────────┬────────────────────────────┘
                                                 │
                               HTTP (REST) / WebSockets
                                                 │
                                                 ▼
                     ┌────────────────────────────────────────────────────────┐
                     │                 FastAPI Backend Engine                 │
                     │             (Python 3.11+ / Pydantic v2)               │
                     └──────┬────────────────────┬────────────────────┬───────┘
                            │                    │                    │
              SQLAlchemy 2.0 ORM                 │            Cryptographic Check
                            ▼                    ▼                    ▼
                ┌───────────────────────┐  ┌───────────┐  ┌───────────────────────┐
                │   MySQL / SQLite DB   │  │ Random    │  │   Razorpay Gateway    │
                │ (Users, Visits, Queue,│  │ Forest    │  │ (HMAC-SHA256 Webhook  │
                │ Triage, Prescriptions)│  │ ML Engine │  │ & Payment Verify)     │
                └───────────────────────┘  └───────────┘  └───────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite 5, Vanilla CSS / Tailwind | Fast, responsive single-page clinical portal |
| **Icons & Design** | Lucide React, Plus Jakarta Sans, Outfit | Modern healthcare aesthetics & visual hierarchy |
| **Backend API** | FastAPI (Python 3.11+) | High-performance asynchronous REST endpoints & WebSockets |
| **Database** | MySQL 8.0 / SQLite (via SQLAlchemy 2.0) | Relational store with ACID compliance and indexing |
| **Machine Learning** | Scikit-Learn (Random Forest), Pandas, Joblib | Triage prediction, feature importance, and normalization |
| **Security & Auth** | OAuth2, JWT (HS256), Role-Based Access Control | Secure authentication for Patient, Nurse, Doctor, Admin |
| **Payment Gateway** | Razorpay SDK (HMAC-SHA256) | Encrypted payment collection and automatic reconciliation |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js**: v18.0 or higher
* **Python**: v3.11 or higher
* **Git** installed on your system

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/muralimdev07/Mediflow-Ai.git
cd Mediflow-Ai
```

---

### Step 2: Backend Setup
1. Navigate to the backend directory and create a virtual environment:
```bash
cd backend
python -m venv venv
```
2. Activate the virtual environment:
   * **Windows**: `venv\Scripts\activate`
   * **macOS / Linux**: `source venv/bin/activate`

3. Install required Python packages:
```bash
pip install -r requirements.txt
```

4. Seed default clinical roles and test accounts:
```bash
python -m scripts.seed
python sync_doctor_passwords.py
```

5. Start the FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
* **API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Alternative ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```
* **Web Portal URL**: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Demo Credentials

For quick testing during development and demonstrations, pre-configured role-based accounts are available:

| Role | Name | Official Email | Password | Access Portal |
|---|---|---|---|---|
| **Doctor (Neurology)** | Dr. Arun Kumar | `dr.kumar@mediflow.ai` | `Doctor@123` | `/login` or `/doctor/login` |
| **Doctor (Cardiology)** | Dr. Rajesh Sharma | `dr.sharma@mediflow.ai` | `Doctor@123` | `/login` or `/doctor/login` |
| **Doctor (Pediatrics)** | Dr. Priya Singh | `dr.singh@mediflow.ai` | `Doctor@123` | `/login` or `/doctor/login` |
| **Staff Nurse** | Nurse Anita | `nurse.anita@mediflow.ai` | `Nurse@123` | `/nurse/login` |
| **Staff Nurse** | Nurse Mary | `nurse.mary@mediflow.ai` | `Nurse@123` | `/nurse/login` |
| **Patient** | Demo Patient | `patient@mediflow.ai` | `Patient@123` | `/login` |
| **Admin** | Hospital Super Admin | `admin@mediflow.ai` | `Admin@123` | `/login` |

---

## 📁 Repository Structure

```
Mediflow-Ai/
├── backend/                        # FastAPI Backend Application
│   ├── app/
│   │   ├── models/                 # SQLAlchemy DB Models (User, Doctor, Queue, Triage, Payment)
│   │   ├── routers/                # REST Routes (Auth, Doctor, Nurse, Queue, Consultations)
│   │   ├── schemas/                # Pydantic Schemas for Validation
│   │   ├── services/               # Business Logic (Auth, Queue, Consultation, Payment)
│   │   └── main.py                 # FastAPI Application Factory & CORS Configuration
│   ├── scripts/seed.py             # Database Initialization & Sample Data Seeder
│   └── requirements.txt            # Backend Python Dependencies
│
├── frontend/                       # React 18 + Vite Frontend Application
│   ├── public/                     # Static Hospital Visuals, Icons, & SVGs
│   ├── src/
│   │   ├── components/             # Reusable UI Components, AppShell, Header, & LandingPage
│   │   ├── features/               # Domain-driven Modules
│   │   │   ├── auth/               # Login & Multi-step Registration Pages
│   │   │   ├── doctor/             # Doctor Dashboard, Queue, Appointments, History, & Prescriptions
│   │   │   ├── nurse/              # Nurse Triage Roster & Vitals Capture Desk
│   │   │   ├── patient/            # Patient Dashboard, Symptom Form, & Booking Wizard
│   │   │   ├── contact/            # Hospital Support & Contact Interface
│   │   │   └── about/              # Clinical Overview & Platform Mission
│   │   ├── services/api.js         # Axios API Client with JWT Interceptors
│   │   └── router.jsx              # React Router DOM Configuration
│   └── package.json                # Frontend NPM Dependencies
│
├── ml/                             # Machine Learning & AI Triage Pipeline
│   ├── train_priority_model.py     # Random Forest Classifier Training Script
│   ├── predict_priority.py         # Priority Prediction Interface
│   ├── test_priority.py            # Model Test Bench & Accuracy Evaluation
│   └── priority_model.pkl          # Serialized Trained Model
│
└── README.md                       # Master Project Documentation
```

---

## 🔒 Security & Data Privacy
* **HIPAA Compliance Guidelines**: Clinical records and patient observations are isolated and encrypted.
* **Token-Based Security**: JSON Web Tokens (JWT) with standard expiration and secure storage.
* **Financial Integrity**: 256-bit SHA256 HMAC signature validation on all Razorpay payments.
* **Role-Based Access Control (RBAC)**: Strict permission boundaries ensuring Nurses, Doctors, Patients, and Administrators only access authorized views.

---

## 📜 License
This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for academic and clinical research purposes.
