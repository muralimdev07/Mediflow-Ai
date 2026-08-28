"""Common Pydantic schemas used across modules."""

from datetime import datetime
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success response wrapper."""
    success: bool = True
    data: T
    request_id: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""
    success: bool = True
    data: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    request_id: Optional[str] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: ErrorDetail
    request_id: Optional[str] = None


class MessageResponse(BaseModel):
    """Simple message response."""
    success: bool = True
    message: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    database: str
    ai_model: str
    timestamp: datetime
