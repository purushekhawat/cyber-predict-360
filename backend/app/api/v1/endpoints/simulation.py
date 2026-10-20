from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import requests
from app.core.config import settings

router = APIRouter()

class CounterfactualRequest(BaseModel):
    complaint_ack_id: str = Field(..., example="ACK20260900001")
    origin_hub: str = Field("Delhi_NCR", example="Delhi_NCR")
    latitude: float = Field(28.6139, example=28.6139)
    longitude: float = Field(77.2090, example=77.2090)
    crime_category: Optional[str] = Field("UPI_FRAUD")
    loss_amount: float = Field(50000.0, example=50000.0)
    hypothetical_additional_amount: float = Field(100000.0, example=100000.0)
    hypothetical_extra_hops: Optional[int] = Field(1, example=1)
    hypothetical_crime_category: Optional[str] = Field(None)

@router.post("/counterfactual", summary="Execute Counterfactual Cybercrime Simulation")
def execute_counterfactual_simulation(payload: CounterfactualRequest) -> Dict[str, Any]:
    """
    Proxy endpoint connecting backend to Python Simulation Engine.
    Executes in-memory counterfactual simulation without mutating PostgreSQL or Neo4j database records.
    """
    ml_url = f"{settings.ML_SERVICE_URL}/api/v1/predict/counterfactual"
    
    try:
        response = requests.post(ml_url, json=payload.dict(), timeout=5.0)
        if response.status_code == 200:
            return response.json()
        else:
            from ml_service.app.pipeline.simulation import counterfactual_simulator
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
        try:
            from ml_service.app.pipeline.simulation import counterfactual_simulator
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
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Simulation Engine Error: {str(inner_e)}")
