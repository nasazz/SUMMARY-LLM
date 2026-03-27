from fastapi import Request, status
from fastapi.responses import JSONResponse
from loguru import logger

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    The ultimate safety net. Catches any unhandled 500 Server Errors,
    logs the stack trace, and sanitizes the response.
    """
    # Safely extract the correlation ID if it exists
    correlation_id = getattr(request.state, "correlation_id", "UNKNOWN")
    
    # Log the full error and the endpoint that caused it
    logger.exception(
        f"Unhandled Exception occurred at {request.method} {request.url} | Error: {str(exc)}"
    )
    
    # Return a sanitized response so we don't leak infrastructure details to the client
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected server error occurred.",
            "correlation_id": correlation_id
        },
        headers={"X-Correlation-ID": correlation_id}
    )