from typing import Dict, Any
import numpy as np
import pandas as pd

class SpatioTemporalFeatureExtractor:
    """
    Feature Engineering Utility for CYBER-PREDICT 360 ML Models.
    Extracts spatial, temporal, and financial velocity features from synthetic datasets.
    """

    def haversine_np(self, lat1, lon1, lat2, lon2):
        R = 6371.0
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
        return R * c

    def extract_features(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        complaints = datasets.get("complaints", pd.DataFrame())
        withdrawals = datasets.get("withdrawals", pd.DataFrame())
        txns = datasets.get("transactions", pd.DataFrame())

        if complaints.empty or withdrawals.empty:
            return pd.DataFrame()

        # Merge complaint origin and withdrawal target events
        merged = pd.merge(
            withdrawals,
            complaints[["complaint_ack_id", "crime_category", "origin_hub", "latitude", "longitude", "incident_timestamp"]],
            on="complaint_ack_id",
            how="inner",
            suffixes=("_withdrawal", "_complaint")
        )

        # 1. Spatial Distance Feature (Complaint location to ATM location)
        merged["distance_complaint_to_atm_km"] = self.haversine_np(
            merged["latitude"].values,
            merged["longitude"].values,
            merged["atm_latitude"].values,
            merged["atm_longitude"].values
        )

        # 2. Temporal Features
        merged["withdrawal_dt"] = pd.to_datetime(merged["withdrawal_timestamp"], format="ISO8601")
        merged["incident_dt"] = pd.to_datetime(merged["incident_timestamp"], format="ISO8601")
        merged["withdrawal_hour"] = merged["withdrawal_dt"].dt.hour
        merged["withdrawal_dayofweek"] = merged["withdrawal_dt"].dt.dayofweek

        # Time-of-day bucket (Night: 23-05, Morning: 06-11, Afternoon: 12-16, Evening: 17-22)
        def bucket_hour(h):
            if 23 <= h or h <= 5:
                return "NIGHT_HIGH_RISK"
            elif 6 <= h <= 11:
                return "MORNING"
            elif 12 <= h <= 16:
                return "AFTERNOON"
            else:
                return "EVENING"

        merged["time_bucket"] = merged["withdrawal_hour"].apply(bucket_hour)

        # 3. Transaction Hop Depth & Mule Velocity Features
        if not txns.empty:
            hop_counts = txns.groupby("complaint_ack_id")["hop_level"].max().reset_index()
            hop_counts.rename(columns={"hop_level": "max_hop_depth"}, inplace=True)
            merged = pd.merge(merged, hop_counts, on="complaint_ack_id", how="left")
        else:
            merged["max_hop_depth"] = 1

        feature_cols = [
            "withdrawal_id",
            "complaint_ack_id",
            "crime_category",
            "atm_id",
            "bank_name",
            "amount",
            "lag_hours_post_incident",
            "distance_complaint_to_atm_km",
            "withdrawal_hour",
            "withdrawal_dayofweek",
            "time_bucket",
            "max_hop_depth",
            "risk_level"
        ]

        return merged[feature_cols]

feature_extractor = SpatioTemporalFeatureExtractor()
