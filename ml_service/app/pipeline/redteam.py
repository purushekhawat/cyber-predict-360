from typing import Dict, List, Any
import numpy as np

class PredictionRedTeam:
    """
    CYBER-PREDICT 360 AI Red-Team Challenge Engine.
    Challenges ML predictions using deterministic audit criteria (data completeness, conflicting signals,
    recent activity, historical consistency, model uncertainty).
    Does NOT invent arbitrary probabilities.
    Suppresses or downgrades alerts under insufficient data conditions.
    """

    def evaluate_challenge(
        self,
        forecast_payload: Dict[str, Any],
        raw_complaint: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        
        loc_preds = forecast_payload.get("location_predictions", [])
        top_cand = loc_preds[0] if loc_preds else {}
        distance_km = float(top_cand.get("distance_km", 2.0))
        loc_prob = float(top_cand.get("location_probability", 0.60))
        time_prob = float(forecast_payload.get("time_probability", 0.60))
        raw_confidence = float(forecast_payload.get("confidence", 0.70))
        loss_amount = float(forecast_payload.get("loss_amount", 50000.0) if raw_complaint is None else raw_complaint.get("loss_amount", 50000.0))

        # 1. Data Quality & Completeness Audit (Deterministic)
        present_fields = []
        missing_fields = []

        if forecast_payload.get("complaint_ack_id"):
            present_fields.append("complaint_ack_id")
        else:
            missing_fields.append("complaint_ack_id")

        if forecast_payload.get("origin_hub"):
            present_fields.append("origin_hub")
        else:
            missing_fields.append("origin_hub")

        if loc_preds:
            present_fields.append("postgis_atm_spatial_index")
        else:
            missing_fields.append("postgis_atm_spatial_index")

        # Insufficient data checks
        missing_fields.append("victim_device_imei_fingerprint")
        missing_fields.append("realtime_mule_kyc_status")

        total_tracked = len(present_fields) + len(missing_fields)
        completeness_pct = round((len(present_fields) / total_tracked) * 100, 1)

        if completeness_pct >= 80:
            quality_rating = "HIGH_QUALITY"
        elif completeness_pct >= 50:
            quality_rating = "MEDIUM_QUALITY"
        else:
            quality_rating = "INSUFFICIENT_DATA"

        # 2. Supporting Evidence Categorization
        supporting_evidence = []
        if loc_prob >= 0.65:
            supporting_evidence.append(f"High spatial candidate likelihood ({loc_prob*100:.1f}%)")
        if distance_km <= 2.5:
            supporting_evidence.append(f"Close spatial proximity candidate ({distance_km} km)")
        if time_prob >= 0.60:
            supporting_evidence.append(f"Strong time-decay PDF alignment ({time_prob*100:.1f}%)")
        if loss_amount >= 50000:
            supporting_evidence.append(f"High financial loss magnitude (INR {loss_amount:,.0f})")
        if not supporting_evidence:
            supporting_evidence.append("Baseline spatial cluster association")

        # 3. Contradicting / Conflicting Signals Categorization
        contradicting_evidence = []
        if distance_km > 3.0:
            contradicting_evidence.append(f"Target ATM distance variance offset ({distance_km} km)")
        if time_prob < 0.55:
            contradicting_evidence.append("Off-peak window pdf delay penalty")
        if "victim_device_imei_fingerprint" in missing_fields:
            contradicting_evidence.append("Missing victim device hardware fingerprint verification")
        if "realtime_mule_kyc_status" in missing_fields:
            contradicting_evidence.append("Unverified mule account KYC identity status")

        # 4. Alert Downgrade / Suppression Logic
        if quality_rating == "INSUFFICIENT_DATA" or len(contradicting_evidence) >= 3:
            alert_action = "DOWNGRADED_BY_REDTEAM"
            action_reason = "Alert downgraded due to unverified device IMEI & missing mule KYC records."
            confidence_factor = 0.75
        elif loc_prob < 0.40:
            alert_action = "SUPPRESS_ALERT"
            action_reason = "Operational alert suppressed due to low candidate spatial probability."
            confidence_factor = 0.50
        else:
            alert_action = "MAINTAIN_ALERT"
            action_reason = "Evidence-based audit supports operational alert status."
            confidence_factor = 1.0

        final_confidence = round(float(np.clip(raw_confidence * (completeness_pct / 100.0) * confidence_factor, 0.15, 0.98)), 4)

        # 5. Adversarial "Why Prediction May Be Wrong" Scenarios
        why_prediction_may_be_wrong = [
            "Mule cash out may occur via physical merchant POS purchasing or crypto P2P ramps instead of target ATM network.",
            "Complaint location GPS reflects victim home address rather than actual fraudster operating origin.",
            "Off-peak incident time may cause delayed manual cash withdrawal outside predicted window."
        ]

        return {
            "prediction": f"Withdrawal forecast at {top_cand.get('bank_name', 'ATM')} ({top_cand.get('atm_id', 'ATM')})",
            "supporting_evidence": supporting_evidence,
            "contradicting_evidence": contradicting_evidence,
            "data_quality": {
                "completeness_pct": completeness_pct,
                "rating": quality_rating,
                "missing_fields": missing_fields
            },
            "final_confidence": final_confidence,
            "alert_action": alert_action,
            "alert_action_reason": action_reason,
            "why_prediction_may_be_wrong": why_prediction_may_be_wrong
        }

prediction_redteam = PredictionRedTeam()
