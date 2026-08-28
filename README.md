# MediFlow AI

AI-powered patient-doctor matching and hospital queue management system.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS v3 |
| Backend | FastAPI + SQLAlchemy 2.0 + Pydantic v2 |
| Database | MySQL 8.0 (XAMPP) |
| AI/ML | XGBoost + scikit-learn + SHAP |
| Payments | Razorpay |
| Real-Time | WebSocket |

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- XAMPP (MySQL running on port 3306)

### 1. Clone & Setup Environment

```bash
# Copy environment files
cp .env.example .env

# Edit .env with your credentials (Google OAuth, Razorpay, etc.)
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed database
python -m scripts.seed

# Train AI model
python -m scripts.train_model

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Docker Setup

```bash
docker-compose up -d
```

## Project Structure

```
MediflowAI/
├── backend/          # FastAPI application
├── frontend/         # React + Vite application
├── docs/             # Documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

## License

MIT
