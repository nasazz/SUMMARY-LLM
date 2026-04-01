import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the absolute path to the .env file in the directory above 'src'
# (FastApiBoilerplate/.env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str
    API_V1_STR: str

    # Security Settings
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # Database Settings
    DATABASE_URL: str

    # Celery Settings
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # AI Configurations
    OPENAI_API_KEY: str

    # Pydantic Configuration to read from our .env file via absolute path
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH), 
        env_file_encoding="utf-8",
        extra="ignore" # Allow extra fields in .env without failing
    )


# Instantiate the settings globally so it can be imported cleanly across the app
settings = Settings()  # pyright: ignore[reportCallIssue]