from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db, verify_db_connection

router = APIRouter()

@router.get("", summary="General Backend Health Check")
@router.get("/", summary="General Backend Health Check")
def health_check():
    """Returns basic system status, timestamp, and environment details."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/db", summary="Database & PostGIS Status")
def db_health_check():
    """Verifies connection to PostgreSQL and PostGIS extension status."""
    db_status = verify_db_connection()
    return {
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
