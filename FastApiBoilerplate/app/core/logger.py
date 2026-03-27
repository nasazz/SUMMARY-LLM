import sys
from loguru import logger

def setup_logging() -> None:
    """
    Configures the global Serilog-equivalent logger.
    """
    # 1. Remove the default standard error logger
    logger.remove()

    # CRITICAL: We must provide a default value, otherwise Loguru will crash 
    # if it tries to log something outside of an HTTP request (like startup events)
    logger.configure(extra={"correlation_id": "SYSTEM"})

    # Notice the new <magenta>{extra[correlation_id]}</magenta> tag
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<magenta>{extra[correlation_id]}</magenta> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )

    logger.add(sys.stdout, format=log_format, level="INFO")


    # 3. Add a production file logger (Rotating and serialized to JSON)
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log", 
        rotation="00:00",      # Create a new file every day at midnight
        retention="30 days",   # Keep logs for 30 days
        serialize=True,        # Write as structured JSON for tools like Datadog/Splunk
        level="WARNING",       # Only log Warnings and Errors to the file to save space
        enqueue=True           # Make it thread-safe for async operations
    )