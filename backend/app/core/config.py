import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBER-PREDICT 360 Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev_secret_key_cyberpredict_360_sih_2026"
    
    # PostgreSQL / PostGIS Database
    POSTGRES_USER: str = "cyberadmin"
    POSTGRES_PASSWORD: str = "cyberpassword_dev_123"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "cyberpredict_db"
    DATABASE_URL: str = "postgresql://cyberadmin:cyberpassword_dev_123@localhost:5432/cyberpredict_db"
    
    # ML Service Endpoint
    ML_SERVICE_URL: str = "http://localhost:8001"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
