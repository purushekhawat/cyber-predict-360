from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.pipeline.predictor import predictor

router = APIRouter()

@router.get("", summary="ML Service Health Check")
@router.get("/", summary="ML Service Health Check")
def health_check():
    """Returns ML service operational status, model pipeline state, and timestamp."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "model_status": predictor.get_status(),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
