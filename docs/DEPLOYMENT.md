# MediFlow AI — Deployment Guide

## 1. Local Development (XAMPP + Uvicorn + Vite)

### Prerequisites
- Python 3.11+
- Node.js 18+
- XAMPP with MySQL running on `localhost:3306`

### Setup Database in XAMPP
Open XAMPP Control Panel → Start Apache & MySQL.
Open `http://localhost/phpmyadmin` and create a database named `mediflow_ai`.

### Run Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

# Run seed script (creates tables & initial seed data)
python -m scripts.seed

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 2. Docker Compose Deployment

```bash
# Copy env configuration
cp .env.example .env

# Build and start container stack (MySQL + Backend + Frontend)
docker-compose up --build -d
```

Services exposed:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MySQL DB**: localhost:3307 (passwordless root)
