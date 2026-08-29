"""
MediFlow AI — FastAPI Application Entry Point

Registers all routers, middleware, WebSocket, and startup events.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query

from app.core.config import get_settings
from app.core.middleware import setup_exception_handlers, setup_middleware
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.queue import router as queue_router
from app.routers.endpoints import (
    visits_router,
    triage_router,
    matching_router,
    consultation_router,
    payments_router,
    invoices_router,
    departments_router,
    rooms_router,
    analytics_router,
    health_router,
    doctors_router,
    patient_router,
    appointments_router,
)
from app.routers.doctor import doctor_router
from app.routers.nurse import router as nurse_router
from app.websocket import ws_manager

settings = get_settings()


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI-powered patient-doctor matching and hospital queue management",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Middleware
    setup_middleware(app)
    setup_exception_handlers(app)

    # API Routers — all under /api/v1
    api_prefix = "/api/v1"
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(doctor_router, prefix=api_prefix)
    app.include_router(nurse_router, prefix=api_prefix)
    app.include_router(queue_router, prefix=api_prefix)
    app.include_router(visits_router, prefix=api_prefix)
    app.include_router(triage_router, prefix=api_prefix)
    app.include_router(matching_router, prefix=api_prefix)
    app.include_router(consultation_router, prefix=api_prefix)
    app.include_router(payments_router, prefix=api_prefix)
    app.include_router(invoices_router, prefix=api_prefix)
    app.include_router(departments_router, prefix=api_prefix)
    app.include_router(rooms_router, prefix=api_prefix)
    app.include_router(analytics_router, prefix=api_prefix)
    app.include_router(health_router, prefix=api_prefix)
    app.include_router(doctors_router, prefix=api_prefix)
    app.include_router(patient_router, prefix=api_prefix)
    app.include_router(appointments_router, prefix=api_prefix)

    # WebSocket endpoint
    @app.websocket("/ws/{user_id}")
    async def websocket_endpoint(
        websocket: WebSocket,
        user_id: str,
        channels: str = Query(""),
    ):
        """WebSocket endpoint for real-time updates.

        Connect: ws://localhost:8000/ws/{user_id}?channels=dept_xxx,dept_yyy
        """
        await ws_manager.connect(websocket, user_id)

        # Subscribe to requested channels
        if channels:
            for channel in channels.split(","):
                ws_manager.subscribe(user_id, channel.strip())

        try:
            while True:
                data = await websocket.receive_json()
                action = data.get("action")
                if action == "subscribe":
                    ws_manager.subscribe(user_id, data.get("channel", ""))
                elif action == "unsubscribe":
                    ws_manager.unsubscribe(user_id, data.get("channel", ""))
                elif action == "ping":
                    await ws_manager.send_personal(user_id, "pong", {})
        except WebSocketDisconnect:
            ws_manager.disconnect(user_id)

    # Startup event
    @app.on_event("startup")
    async def startup():
        print(f"[Main] {settings.APP_NAME} starting...")
        print(f"[Main] Environment: {settings.APP_ENV}")
        print(f"[Main] Database: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
        print(f"[Main] Razorpay: {'Test Mode' if settings.RAZORPAY_TEST_MODE else 'Live Mode'}")

        # Create database tables if they don't exist
        if settings.DEBUG:
            from app.db import Base
            from app.db.session import engine
            import app.models  # noqa: F401
            Base.metadata.create_all(bind=engine)
            print("[Main] Database tables created/verified.")

    return app


# Create app instance
app = create_app()
