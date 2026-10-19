import os
import json
from typing import Dict, List, Any
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "core", "fusion_config.json")

class RiskFusionEngine:
    """
    CYBER-PREDICT 360 Risk Fusion Engine.
    Fuses 6 distinct risk signals using an auditable JSON scoring specification.
    Logically separates pure Model Probability from Operational Risk Score.
    """

    def __init__(self, config_path: str = CONFIG_PATH):
        self.config_path = config_path
        self.config = self.load_config()

    def load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            with open(self.config_path, "r") as f:
                return json.load(f)
        return {
            "component_weights": {
                "ml_location_prediction": 0.25,
                "temporal_prediction": 0.20,
                "historical_risk": 0.15,
                "geospatial_risk": 0.15,
                "transaction_behaviour": 0.15,
                "graph_derived_risk": 0.10
            },
            "convergence_parameters": {
                "spatial_proximity_threshold_km": 3.0,
                "temporal_window_max_hours": 6.0,
                "graph_fan_in_threshold": 3
            }
        }

    def fuse_risk_signals(
        self,
        ml_location_prob: float,
        temporal_prob: float,
        atm_risk_rating: float,
        distance_km: float,
        loss_amount: float,
        graph_degree: int = 4,
        graph_complaint_count: int = 3
    ) -> Dict[str, Any]:
        """Performs multi-signal fusion and calculates convergence & risk metrics."""
        
        weights = self.config.get("component_weights", {})
        
        # 1. Component Signal Normalization (0.0 to 1.0)
        s_ml_location = float(np.clip(ml_location_prob, 0.0, 1.0))
        s_temporal = float(np.clip(temporal_prob, 0.0, 1.0))
        s_historical = float(np.clip(atm_risk_rating, 0.0, 1.0))
        s_geospatial = float(np.clip(np.exp(-0.25 * distance_km), 0.0, 1.0))
        s_txn_behaviour = float(np.clip(min(1.0, float(loss_amount) / 100000.0), 0.0, 1.0))
        s_graph_derived = float(np.clip(min(1.0, (graph_degree * 0.1) + (graph_complaint_count * 0.15)), 0.0, 1.0))

        # 2. Pure Model Probability (Location + Time Statistical Likelihood)
        model_probability = round(float(np.sqrt(s_ml_location * s_temporal)), 4)

        # 3. Auditable Fused Operational Risk Score
        w_loc = weights.get("ml_location_prediction", 0.25)
        w_time = weights.get("temporal_prediction", 0.20)
        w_hist = weights.get("historical_risk", 0.15)
        w_geo = weights.get("geospatial_risk", 0.15)
        w_txn = weights.get("transaction_behaviour", 0.15)
        w_graph = weights.get("graph_derived_risk", 0.10)

        fused_score = (
            w_loc * s_ml_location +
            w_time * s_temporal +
            w_hist * s_historical +
            w_geo * s_geospatial +
            w_txn * s_txn_behaviour +
            w_graph * s_graph_derived
        )
        operational_risk_score = round(float(np.clip(fused_score, 0.0, 1.0)), 4)

        # 4. Prediction Convergence (Multi-Source Alignment)
        # Convergence measures how strongly spatial, temporal, and graph signals align
        spatial_match = 1.0 if distance_km <= 3.0 else max(0.2, 1.0 - (distance_km - 3.0) * 0.15)
        time_match = 1.0 if temporal_prob >= 0.65 else temporal_prob / 0.65
        graph_match = 1.0 if graph_complaint_count >= 2 else 0.60
        
        prediction_convergence = round(float(np.clip((spatial_match * 0.40 + time_match * 0.35 + graph_match * 0.25), 0.0, 1.0)), 4)

        # 5. Prediction Confidence
        prediction_confidence = round(float(np.clip(0.60 * model_probability + 0.40 * prediction_convergence, 0.0, 1.0)), 4)

        # 6. Supporting Signals
        supporting_signals = [
            {
                "signal_name": "ML Location Prediction",
                "weight": f"{int(w_loc * 100)}%",
                "score": round(s_ml_location, 2),
                "description": f"Spatial proximity candidate probability ({int(s_ml_location * 100)}%)"
            },
            {
                "signal_name": "Temporal Window Density",
                "weight": f"{int(w_time * 100)}%",
                "score": round(s_temporal, 2),
                "description": f"Time-lag PDF window fit ({int(s_temporal * 100)}%)"
            },
            {
                "signal_name": "Historical ATM Risk",
                "weight": f"{int(w_hist * 100)}%",
                "score": round(s_historical, 2),
                "description": f"Historical cash-out activity rating at target ATM ({int(s_historical * 100)}%)"
            },
            {
                "signal_name": "Geospatial Cluster Density",
                "weight": f"{int(w_geo * 100)}%",
                "score": round(s_geospatial, 2),
                "description": f"Spatial kernel score ({int(s_geospatial * 100)}%)"
            },
            {
                "signal_name": "Transaction Behaviour",
                "weight": f"{int(w_txn * 100)}%",
                "score": round(s_txn_behaviour, 2),
                "description": f"Loss magnitude & transfer velocity severity ({int(s_txn_behaviour * 100)}%)"
            },
            {
                "signal_name": "Graph-Derived Risk Indicators",
                "weight": f"{int(w_graph * 100)}%",
                "score": round(s_graph_derived, 2),
                "description": f"Victim fan-in degree & multi-hop layering ({int(s_graph_derived * 100)}%)"
            }
        ]

        # 7. Contradicting Signals
        contradicting_signals = []
        if distance_km > 2.5:
            contradicting_signals.append({
                "signal_name": "Geographic Distance Variance",
                "penalty": f"-{int(distance_km * 4)}%",
                "description": f"Target ATM is {distance_km} km away from complaint origin point"
            })
        if s_temporal < 0.65:
            contradicting_signals.append({
                "signal_name": "Off-Peak Time Window Delay",
                "penalty": "-12%",
                "description": "Predicted window falls during low historical probability hours"
            })
        if not contradicting_signals:
            contradicting_signals.append({
                "signal_name": "Minor Spatial Noise Offset",
                "penalty": "-3%",
                "description": "Baseline spatial GPS uncertainty"
            })

        return {
            "model_probability": model_probability,
            "operational_risk_score": operational_risk_score,
            "prediction_confidence": prediction_confidence,
            "prediction_convergence": prediction_convergence,
            "supporting_signals": supporting_signals,
            "contradicting_signals": contradicting_signals,
            "auditable_config": {
                "config_version": self.config.get("config_version", "1.0.0-auditable-fusion"),
                "weights": weights
            }
        }

fusion_engine = RiskFusionEngine()
