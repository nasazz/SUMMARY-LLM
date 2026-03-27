import uuid
from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Generates a unique ID for every request for distributed tracing.
    Equivalent to .NET's TraceIdentifier.
    """
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # 1. Get the ID from the incoming header (if a microservice called us) 
        # or generate a brand new one.
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        
        # 2. Attach it to the request state so controllers/services can access it if needed
        request.state.correlation_id = correlation_id
        
        # 3. Bind it to Loguru's context for this specific async task
        with logger.contextualize(correlation_id=correlation_id):
            # Process the actual request
            response = await call_next(request)
            
            # 4. Attach the ID to the outgoing response so the Angular client can see it
            response.headers["X-Correlation-ID"] = correlation_id
            return response