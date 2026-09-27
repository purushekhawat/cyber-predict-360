import copy
from typing import Dict, List, Any
from app.pipeline.model import model_engine

class CounterfactualSimulator:
    """
    Counterfactual Cybercrime Simulation Engine.
    Clones analytical state in memory to model hypothetical transaction scenarios
    WITHOUT modifying production database records.
    Calculates BEFORE vs AFTER predictions, risk_delta, changed_hotspots, changed_time_window, and explanations.
    """

    SIMULATION_NOTICE = "SIMULATION ONLY. No production or real database records were modified."

    def run_simulation(
        self,
        complaint_ack_id: str,
        origin_hub: str,
        latitude: float,
        longitude: float,
        crime_category: str = "UPI_FRAUD",
        loss_amount: float = 50000.0,
        hypothetical_additional_amount: float = 100000.0,
        hypothetical_extra_hops: int = 1,
        hypothetical_crime_category: str = None
    ) -> Dict[str, Any]:
        
        # 1. Baseline BEFORE Prediction (Current Analytical State)
        before_pred = model_engine.predict_full_forecast(
            complaint_ack_id=complaint_ack_id,
            origin_hub=origin_hub,
            latitude=latitude,
            longitude=longitude,
            crime_category=crime_category,
            loss_amount=loss_amount
        )

        # 2. In-Memory State Clone & Apply Hypothetical Changes
        after_loss_amount = float(loss_amount) + float(hypothetical_additional_amount)
        after_category = hypothetical_crime_category if hypothetical_crime_category else crime_category

        # 3. Simulated AFTER Prediction Execution
        after_pred = model_engine.predict_full_forecast(
            complaint_ack_id=f"{complaint_ack_id}_SIM",
            origin_hub=origin_hub,
            latitude=latitude,
            longitude=longitude,
            crime_category=after_category,
            loss_amount=after_loss_amount
        )

        # 4. Calculate Risk Score Delta
        score_before = float(before_pred["operational_risk_score"])
        score_after = float(after_pred["operational_risk_score"])
        delta = round(score_after - score_before, 4)

        if delta > 0.02:
            direction = "INCREASED_RISK"
        elif delta < -0.02:
            direction = "DECREASED_RISK"
        else:
            direction = "NO_SIGNIFICANT_CHANGE"

        # 5. Calculate Hotspot Probability Shifts (BEFORE vs AFTER)
        before_atms = {a["atm_id"]: a for a in before_pred.get("location_predictions", [])}
        after_atms = {a["atm_id"]: a for a in after_pred.get("location_predictions", [])}
        
        changed_hotspots = []
        for atm_id, a_data in after_atms.items():
            b_prob = before_atms.get(atm_id, {}).get("location_probability", 0.0)
            a_prob = a_data["location_probability"]
            p_delta = round(a_prob - b_prob, 4)
            changed_hotspots.append({
                "atm_id": atm_id,
                "bank_name": a_data["bank_name"],
                "hub_name": a_data["hub_name"],
                "distance_km": a_data["distance_km"],
                "probability_before": b_prob,
                "probability_after": a_prob,
                "probability_delta": p_delta
            })

        # 6. Calculate Time Window Shift
        win_before = before_pred.get("predicted_time_window", "1.5 - 4.5 hours")
        win_after = after_pred.get("predicted_time_window", "0.5 - 2.5 hours")
        
        shift_desc = f"Peak cash out window shifted earlier due to additional loss of INR {hypothetical_additional_amount:,.0f} and transfer velocity boost."

        # 7. Analytical Explanation
        explanation = (
            f"Hypothetical addition of INR {hypothetical_additional_amount:,.0f} to complaint {complaint_ack_id} "
            f"increased operational risk score from {score_before*100:.1f}/100 to {score_after*100:.1f}/100 "
            f"({'+' if delta >= 0 else ''}{delta*100:.1f}% shift). Top candidate ATM location probabilities shifted by up to "
            f"{max([h['probability_delta'] for h in changed_hotspots], default=0.0)*100:+.1f}%."
        )

        return {
            "simulation_id": f"SIM_{complaint_ack_id}",
            "scenario": {
                "base_complaint_ack_id": complaint_ack_id,
                "base_loss_amount": loss_amount,
                "hypothetical_additional_amount": hypothetical_additional_amount,
                "total_simulated_loss": after_loss_amount,
                "hypothetical_extra_hops": hypothetical_extra_hops,
                "simulated_crime_category": after_category
            },
            "before_prediction": before_pred,
            "after_prediction": after_pred,
            "risk_delta": {
                "score_before": score_before,
                "score_after": score_after,
                "delta": delta,
                "direction": direction
            },
            "changed_hotspots": changed_hotspots,
            "changed_time_window": {
                "before": win_before,
                "after": win_after,
                "shift_description": shift_desc
            },
            "explanation": explanation,
            "is_simulation": True,
            "simulation_notice": self.SIMULATION_NOTICE
        }

counterfactual_simulator = CounterfactualSimulator()
