from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.logger import setup_logging
from src.core.exceptions import global_exception_handler
from src.core.middleware import CorrelationIdMiddleware

def create_app() -> FastAPI:
    # Initialize the logger before the app starts
    setup_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME, 
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # ADD CORS MIDDLEWARE
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], 
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add Request Tracking Middleware
    app.add_middleware(CorrelationIdMiddleware)

    # Register the Global Exception Handler
    app.add_exception_handler(Exception, global_exception_handler)

    return app


app = create_app()
