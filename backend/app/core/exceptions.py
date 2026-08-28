"""
MediFlow AI — Custom Exception Classes

Structured error handling with consistent error format.
"""

from typing import Any, Optional


class MediFlowException(Exception):
    """Base exception for all application errors."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(MediFlowException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed", details: Optional[dict] = None):
        super().__init__(
            code="AUTHENTICATION_ERROR",
            message=message,
            status_code=401,
            details=details,
        )


class AuthorizationError(MediFlowException):
    """Raised when user lacks required permissions."""

    def __init__(self, message: str = "Insufficient permissions", details: Optional[dict] = None):
        super().__init__(
            code="AUTHORIZATION_ERROR",
            message=message,
            status_code=403,
            details=details,
        )


class NotFoundError(MediFlowException):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str = "Resource", details: Optional[dict] = None):
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} not found",
            status_code=404,
            details=details,
        )


class ValidationError(MediFlowException):
    """Raised when request data fails business validation."""

    def __init__(self, message: str = "Validation failed", details: Optional[dict] = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
        )


class ConflictError(MediFlowException):
    """Raised when a resource conflict occurs (e.g., duplicate)."""

    def __init__(self, message: str = "Resource conflict", details: Optional[dict] = None):
        super().__init__(
            code="CONFLICT_ERROR",
            message=message,
            status_code=409,
            details=details,
        )


class PaymentError(MediFlowException):
    """Raised when a payment operation fails."""

    def __init__(self, message: str = "Payment failed", details: Optional[dict] = None):
        super().__init__(
            code="PAYMENT_ERROR",
            message=message,
            status_code=402,
            details=details,
        )


class ExternalServiceError(MediFlowException):
    """Raised when an external API call fails."""

    def __init__(self, service: str, message: str = "", details: Optional[dict] = None):
        super().__init__(
            code="EXTERNAL_SERVICE_ERROR",
            message=f"{service} service error: {message}",
            status_code=502,
            details=details,
        )
