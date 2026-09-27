from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.health import router as health_router
from app.api.v1.predict import router as predict_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Predictive Analytics Spatial-Temporal Forecasting Engine for Cybercrime Cash Withdrawals",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to CYBER-PREDICT 360 ML Service",
        "docs": f"{settings.API_V1_STR}/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

app.include_router(health_router, prefix=f"{settings.API_V1_STR}/health", tags=["ML Health Check"])
app.include_router(predict_router, prefix=f"{settings.API_V1_STR}/predict", tags=["Withdrawal Forecasting"])
