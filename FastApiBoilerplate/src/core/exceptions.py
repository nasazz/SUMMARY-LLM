from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from loguru import logger
from src.logic.results import Result

def raise_for_result(result: Result, default_status_code: int = status.HTTP_400_BAD_REQUEST) -> None:
    """
    Standardized mapping for the Presentation layer to escalate logical flow failures 
    into correct FastAPI HTTP exceptions.
    """
    if result.is_success:
        return
        
    error_msg = result.error or "An unknown error occurred"
    err_lower = error_msg.lower()
    
    if "not found" in err_lower:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_msg)
    elif "unauthorized" in err_lower or "access denied" in err_lower:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)
    elif "forbidden" in err_lower:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error_msg)
        
    raise HTTPException(status_code=default_status_code, detail=error_msg)


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