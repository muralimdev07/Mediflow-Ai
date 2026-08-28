"""
MediFlow AI — Database Session Management

Engine creation with automatic MySQL DB creation and SQLite fallback.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

db_url = settings.DATABASE_URL

# Auto-create MySQL database if connected but DB missing
if "mysql" in db_url:
    try:
        # Connection without database specified to create database
        base_url = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}"
        root_engine = create_engine(base_url, connect_args={"connect_timeout": 3})
        with root_engine.connect() as conn:
            conn.exec_driver_sql(f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME};")
        root_engine.dispose()
        print(f"[Database] MySQL database '{settings.DB_NAME}' verified/created.")
    except Exception as e:
        print(f"[Database] MySQL connection notice: {e}. Using local SQLite database.")
        db_url = "sqlite:///./mediflow_dev.db"

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency that provides a database session per request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
