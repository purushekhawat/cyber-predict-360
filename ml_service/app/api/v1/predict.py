from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.pipeline.predictor import predictor
from app.pipeline.simulation import counterfactual_simulator

router = APIRouter()

class PredictionRequest(BaseModel):
    complaint_ack_id: str = Field(..., example="ACK20260900001")
    origin_hub: str = Field("Delhi_NCR", example="Delhi_NCR")
    latitude: float = Field(28.6139, example=28.6139)
    longitude: float = Field(77.2090, example=77.2090)
    crime_category: Optional[str] = Field("UPI_FRAUD", example="UPI_FRAUD")
    loss_amount: Optional[float] = Field(50000.0, example=50000.0)
    incident_timestamp: Optional[str] = Field(None, example="2026-09-04T01:00:00Z")
    top_k: Optional[int] = Field(5, ge=1, le=20)

class CounterfactualRequest(BaseModel):
    complaint_ack_id: str = Field(..., example="ACK20260900001")
    origin_hub: str = Field("Delhi_NCR", example="Delhi_NCR")
    latitude: float = Field(28.6139, example=28.6139)
    longitude: float = Field(77.2090, example=77.2090)
    crime_category: Optional[str] = Field("UPI_FRAUD", example="UPI_FRAUD")
    loss_amount: float = Field(50000.0, example=50000.0)
    hypothetical_additional_amount: float = Field(100000.0, example=100000.0)
    hypothetical_extra_hops: Optional[int] = Field(1, example=1)
    hypothetical_crime_category: Optional[str] = Field(None)

@router.post("", summary="Predict WHERE and WHEN Cash Withdrawal Will Occur")
@router.post("/", summary="Predict WHERE and WHEN Cash Withdrawal Will Occur")
def predict_withdrawals(payload: PredictionRequest) -> Dict[str, Any]:
    try:
        return predictor.predict_withdrawals(
            complaint_ack_id=payload.complaint_ack_id,
            origin_hub=payload.origin_hub,
            latitude=payload.latitude,
            longitude=payload.longitude,
            crime_category=payload.crime_category or "UPI_FRAUD",
            loss_amount=payload.loss_amount or 50000.0,
            incident_timestamp_str=payload.incident_timestamp,
            top_k=payload.top_k or 5
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Prediction Error: {str(e)}")

@router.post("/counterfactual", summary="Run Non-Mutating Counterfactual Cybercrime Simulation")
def run_counterfactual_simulation(payload: CounterfactualRequest) -> Dict[str, Any]:
    """
    Executes in-memory counterfactual simulation without modifying real database.
    Returns BEFORE vs AFTER comparative analysis, risk_delta, changed_hotspots, and explanations.
    """
    try:
        return counterfactual_simulator.run_simulation(
            complaint_ack_id=payload.complaint_ack_id,
            origin_hub=payload.origin_hub,
            latitude=payload.latitude,
            longitude=payload.longitude,
            crime_category=payload.crime_category or "UPI_FRAUD",
            loss_amount=payload.loss_amount,
            hypothetical_additional_amount=payload.hypothetical_additional_amount,
            hypothetical_extra_hops=payload.hypothetical_extra_hops or 1,
            hypothetical_crime_category=payload.hypothetical_crime_category
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation Engine Error: {str(e)}")
