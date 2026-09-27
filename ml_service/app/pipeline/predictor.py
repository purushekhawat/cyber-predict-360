from typing import Dict, List, Any
from app.pipeline.model import model_engine

class CashWithdrawalPredictor:
    """Predictor service wrapper for DualPredictionEngine (WHERE & WHEN)."""

    def __init__(self):
        self.engine = model_engine

    def get_status(self) -> Dict[str, Any]:
        return {
            "model_version": "2.0.0-dual-where-when",
            "status": "ready",
            "supported_algorithms": [
                "Spatial Decay Kernel & Density Rating (WHERE Location Probability)",
                "Exponential PDF Time-Lag Integration (WHEN Time Probability)",
                "Geometric Mean Model Confidence (Confidence = sqrt(P_loc * P_time))",
                "Composite Risk Score Index (Risk = 0.4*P_loc + 0.3*P_time + 0.3*Loss)"
            ]
        }

    def predict_withdrawals(
        self,
        complaint_ack_id: str,
        origin_hub: str,
        latitude: float,
        longitude: float,
        crime_category: str = "UPI_FRAUD",
        loss_amount: float = 50000.0,
        incident_timestamp_str: str = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        return self.engine.predict_full_forecast(
            complaint_ack_id=complaint_ack_id,
            origin_hub=origin_hub,
            latitude=latitude,
            longitude=longitude,
            crime_category=crime_category,
            loss_amount=loss_amount,
            incident_timestamp_str=incident_timestamp_str,
            top_k=top_k
        )

    def get_clusters(self) -> List[Dict[str, Any]]:
        return self.engine.location_engine.withdrawals_df.groupby("cluster_id").apply(
            lambda g: {
                "cluster_id": int(g.name),
                "latitude": float(g["withdrawal_latitude"].mean()),
                "longitude": float(g["withdrawal_longitude"].mean()),
                "withdrawal_count": len(g)
            }
        ).tolist() if not self.engine.location_engine.withdrawals_df.empty else []

predictor = CashWithdrawalPredictor()
