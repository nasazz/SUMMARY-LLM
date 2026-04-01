import uuid
from contextvars import ContextVar
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

correlation_id_ctx_var: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates or reads a Correlation ID for each request.
    This allows us to trace a single request down through our N-Layer architecture
    and background Celery tasks.
    """
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = correlation_id_ctx_var.set(correlation_id)
        
        try:
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        finally:
            correlation_id_ctx_var.reset(token)
