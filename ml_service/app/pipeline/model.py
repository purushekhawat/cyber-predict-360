import os
from typing import Dict, List, Any
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

from app.pipeline.data_loader import data_loader
from app.pipeline.feature_extractor import feature_extractor
from app.pipeline.time_predictor import time_predictor
from app.pipeline.explainer import explainer
from app.pipeline.fusion_engine import fusion_engine
from app.pipeline.redteam import prediction_redteam

class SpatialLocationPredictor:
    """
    Statistical/ML Spatial Location Predictor (WHERE).
    Uses spatial kernel decay and historical ATM density ratings to calculate numerical location probabilities.
    Zero-LLM mathematical calculation.
    """

    def __init__(self):
        self.atms_df = pd.DataFrame()
        self.withdrawals_df = pd.DataFrame()
        self.dbscan_model = None
        self.is_trained = False

    def train_or_load(self):
        datasets = data_loader.load_all()
        self.atms_df = datasets.get("atms", pd.DataFrame())
        self.withdrawals_df = datasets.get("withdrawals", pd.DataFrame())

        if not self.withdrawals_df.empty:
            coords = self.withdrawals_df[["withdrawal_latitude", "withdrawal_longitude"]].values
            self.dbscan_model = DBSCAN(eps=0.05, min_samples=3).fit(coords)
            self.withdrawals_df["cluster_id"] = self.dbscan_model.labels_

        self.is_trained = True

    def predict_location_candidates(
        self,
        origin_hub: str,
        latitude: float,
        longitude: float,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        if self.atms_df.empty:
            self.train_or_load()

        if self.atms_df.empty:
            return []

        candidates = self.atms_df[self.atms_df["hub_name"] == origin_hub].copy()
        if len(candidates) < top_k:
            candidates = self.atms_df.copy()

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0
            dlat = np.radians(lat2 - lat1)
            dlon = np.radians(lon2 - lon1)
            a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
            return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

        distances = haversine(latitude, longitude, candidates["latitude"].values, candidates["longitude"].values)
        candidates["distance_km"] = distances.round(2)

        spatial_kernel = np.exp(-0.20 * candidates["distance_km"].values)
        risk_rating = candidates["risk_rating"].astype(float).values

        raw_prob = 0.60 * spatial_kernel + 0.40 * risk_rating
        candidates["location_probability"] = np.clip(raw_prob, 0.15, 0.98).round(4)

        top_candidates = candidates.sort_values(by="location_probability", ascending=False).head(top_k)

        results = []
        for idx, row in top_candidates.iterrows():
            results.append({
                "atm_id": row["atm_id"],
                "bank_name": row["bank_name"],
                "address": row["address"],
                "city": row["city"],
                "hub_name": row["hub_name"],
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "distance_km": float(row["distance_km"]),
                "location_probability": float(row["location_probability"])
            })

        return results


class DualPredictionEngine:
    """
    Combined Spatial (WHERE) and Temporal (WHEN) Prediction Engine with Risk Fusion & AI Red-Team Challenge.
    Integrates PredictionRedTeam evaluating data completeness, evidence, alert downgrades, and adversarial challenge scenarios.
    """

    def __init__(self):
        self.location_engine = SpatialLocationPredictor()
        self.time_engine = time_predictor
        self.fusion = fusion_engine
        self.redteam = prediction_redteam

    def predict_full_forecast(
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
        
        # 1. Predict WHERE (Location Candidates & Top Location Probability)
        loc_candidates = self.location_engine.predict_location_candidates(
            origin_hub=origin_hub,
            latitude=latitude,
            longitude=longitude,
            top_k=top_k
        )
        
        top_location_prob = loc_candidates[0]["location_probability"] if loc_candidates else 0.50
        top_distance = loc_candidates[0]["distance_km"] if loc_candidates else 2.0

        # 2. Predict WHEN (Time Window & Time Probability)
        time_res = self.time_engine.predict_time_window(
            incident_timestamp_str=incident_timestamp_str,
            crime_category=crime_category,
            loss_amount=loss_amount
        )
        time_prob = time_res["time_probability"]

        # 3. Fuse Risk Signals Across 6 Components using Auditable RiskFusionEngine
        fused = self.fusion.fuse_risk_signals(
            ml_location_prob=top_location_prob,
            temporal_prob=time_prob,
            atm_risk_rating=0.75,
            distance_km=top_distance,
            loss_amount=loss_amount,
            graph_degree=4,
            graph_complaint_count=3
        )

        risk_score = fused["operational_risk_score"]
        if risk_score >= 0.75:
            risk_level = "CRITICAL"
        elif risk_score >= 0.55:
            risk_level = "HIGH"
        else:
            risk_level = "MEDIUM"

        # 4. Calculate SHAP Explainability & Contradicting Signals
        explain_data = explainer.explain_forecast(
            distance_km=top_distance,
            location_prob=top_location_prob,
            time_prob=time_prob,
            crime_category=crime_category,
            loss_amount=loss_amount
        )

        base_payload = {
            "complaint_ack_id": complaint_ack_id,
            "origin_hub": origin_hub,
            "crime_category": crime_category,
            "loss_amount": loss_amount,
            "location_predictions": loc_candidates,
            "predicted_time_window": time_res["predicted_time_window"],
            "window_start_timestamp": time_res["window_start_timestamp"],
            "window_end_timestamp": time_res["window_end_timestamp"],
            "location_probability": top_location_prob,
            "time_probability": time_prob,
            "model_probability": fused["model_probability"],
            "operational_risk_score": fused["operational_risk_score"],
            "confidence": fused["prediction_confidence"],
            "prediction_convergence": fused["prediction_convergence"],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "supporting_signals": fused["supporting_signals"],
            "contradicting_signals": fused["contradicting_signals"],
            "auditable_config": fused["auditable_config"],
            "explainability": explain_data,
            "disclaimer": explainer.DISCLAIMER_NOTICE
        }

        # 5. Execute AI Red-Team Challenge Evaluation
        redteam_eval = self.redteam.evaluate_challenge(base_payload)
        base_payload["redteam_challenge"] = redteam_eval

        return base_payload

model_engine = DualPredictionEngine()
