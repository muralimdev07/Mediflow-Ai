"""Room Model"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String(20), nullable=False)
    room_type = Column(
        Enum("consultation", "examination", "procedure", "emergency", name="room_type_enum"),
        default="consultation",
        nullable=False,
    )
    status = Column(
        Enum("available", "occupied", "maintenance", "reserved", name="room_status_enum"),
        default="available",
        nullable=False,
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    department = relationship("Department", back_populates="rooms")

    def __repr__(self):
        return f"<Room {self.room_number} ({self.status})>"
