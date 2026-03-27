from fastapi import FastAPI
from app.core.config import settings

# Import our new router
from app.api.plans.plan_router import router as plan_router
from app.api.auth.auth_router import router as auth_router
from app.core.logger import setup_logging
from app.core.exceptions import global_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from app.core.middleware import CorrelationIdMiddleware

def create_app() -> FastAPI:
    # Initialize the logger before the app starts
    setup_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME, 
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # ADD CORS MIDDLEWARE (Must be added before other middlewares)
    # We explicitly allow localhost:4200 for our future Angular app
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200"], 
        allow_credentials=True,
        allow_methods=["*"], # Allows GET, POST, PUT, DELETE, etc.
        allow_headers=["*"], # Allows all headers (including Authorization and our Correlation ID)
    )

    # 2. ADD REQUEST TRACKING MIDDLEWARE
    app.add_middleware(CorrelationIdMiddleware)

    # Register the Global Exception Handler
    app.add_exception_handler(Exception, global_exception_handler)

    #  Register the router with our global API prefix (e.g., /api/v1)
    app.include_router(plan_router, prefix=settings.API_V1_STR)
    app.include_router(auth_router, prefix=settings.API_V1_STR)


    @app.get("/health", tags=["Health"])
    def health_check() -> dict[str, str]:
        return {"status": "healthy", "project": settings.PROJECT_NAME}

    return app


app = create_app()
