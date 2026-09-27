from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import requests
from app.core.config import settings

router = APIRouter()

class ForecastRequest(BaseModel):
    complaint_ack_id: str = Field(..., example="ACK20260900001")
    origin_hub: str = Field("Delhi_NCR", example="Delhi_NCR")
    latitude: float = Field(28.6139, example=28.6139)
    longitude: float = Field(77.2090, example=77.2090)
    crime_category: str = Field("UPI_FRAUD", example="UPI_FRAUD")
    loss_amount: float = Field(50000.0, example=50000.0)
    incident_timestamp: Optional[str] = Field(None)

@router.post("/forecast", summary="Generate WHERE & WHEN Cash Withdrawal Forecast")
def generate_forecast(payload: ForecastRequest) -> Dict[str, Any]:
    ml_url = f"{settings.ML_SERVICE_URL}/api/v1/predict"
    
    try:
        response = requests.post(ml_url, json=payload.dict(), timeout=5.0)
        if response.status_code == 200:
            return response.json()
        else:
            from ml_service.app.pipeline.predictor import predictor
            return predictor.predict_withdrawals(
                complaint_ack_id=payload.complaint_ack_id,
                origin_hub=payload.origin_hub,
                latitude=payload.latitude,
                longitude=payload.longitude,
                crime_category=payload.crime_category,
                loss_amount=payload.loss_amount,
                incident_timestamp_str=payload.incident_timestamp
            )
    except Exception as e:
        try:
            from ml_service.app.pipeline.predictor import predictor
            return predictor.predict_withdrawals(
                complaint_ack_id=payload.complaint_ack_id,
                origin_hub=payload.origin_hub,
                latitude=payload.latitude,
                longitude=payload.longitude,
                crime_category=payload.crime_category,
                loss_amount=payload.loss_amount,
                incident_timestamp_str=payload.incident_timestamp
            )
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Prediction Forecast Error: {str(inner_e)}")
