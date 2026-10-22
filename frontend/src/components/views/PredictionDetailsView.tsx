'use client';

import { useState, useEffect } from 'react';
import { generatePredictionForecast, fetchComplaints, PredictionResponse } from '@/lib/api';

const DEFAULT_FORECAST: PredictionResponse = {
  complaint_ack_id: "ACK20260900001",
  origin_hub: "Delhi_NCR",
  crime_category: "UPI_FRAUD",
  location_predictions: [
    {
      atm_id: "ATM_0098",
      bank_name: "Punjab National Bank",
      address: "Connaught Place, Block C",
      city: "New Delhi",
      hub_name: "Delhi_NCR",
      latitude: 28.6315,
      longitude: 77.2167,
      distance_km: 2.03,
      location_probability: 0.759
    },
    {
      atm_id: "ATM_0042",
      bank_name: "State Bank of India",
      address: "Rajiv Chowk Metro Gate 2",
      city: "New Delhi",
      hub_name: "Delhi_NCR",
      latitude: 28.6328,
      longitude: 77.2195,
      distance_km: 2.35,
      location_probability: 0.684
    }
  ],
  predicted_time_window: "1.18 - 3.68 Hours Post-Incident",
  window_start_timestamp: "2026-09-04T02:10:00Z",
  window_end_timestamp: "2026-09-04T04:40:00Z",
  location_probability: 0.759,
  time_probability: 0.672,
  confidence: 0.618,
  risk_level: "HIGH",
  risk_score: 0.72,
  operational_risk_score: 0.72,
  model_probability: 0.71,
  prediction_convergence: 0.85,
  supporting_signals: [
    { signal_name: "ML Location Candidate", weight: "25%", score: 0.759, description: "High spatial candidate likelihood" },
    { signal_name: "Temporal Window PDF", weight: "20%", score: 0.672, description: "Strong time-lag alignment" }
  ],
  contradicting_signals: [
    { signal_name: "Off-Peak Time Lag", penalty: "-5%", description: "Off-peak incident lag penalty" }
  ],
  auditable_config: {
    config_version: "fusion_config.json v1.0.0",
    weights: { spatial: 0.25, temporal: 0.20, historical: 0.15, geospatial: 0.15, transaction: 0.15, graph: 0.10 }
  },
  explainability: {
    top_contributing_features: [
      { feature: "Historical ATM Cash-Out Frequency", impact: "+24.5%" }
    ],
    positive_contributions: [
      { signal: "Historical ATM Cash-Out Frequency", impact_pct: 24.5 },
      { signal: "Transaction Burst Velocity", impact_pct: 18.2 },
      { signal: "DBSCAN Cluster Proximity", impact_pct: 15.0 },
      { signal: "ATM Accessibility Index", impact_pct: 9.3 }
    ],
    negative_contributions: [
      { signal: "Off-Peak Time Window Lag", impact_pct: -6.2 }
    ],
    disclaimer: "Feature contributions calculated via SHAP engine."
  },
  redteam_challenge: {
    prediction: "Withdrawal forecast at Punjab National Bank (ATM_0098)",
    supporting_evidence: [
      "High spatial candidate likelihood (75.9%)",
      "Close spatial proximity candidate (2.03 km)",
      "Strong time-decay PDF alignment (67.2%)"
    ],
    contradicting_evidence: [
      "Missing victim device hardware fingerprint verification",
      "Unverified mule account KYC identity status"
    ],
    data_quality: {
      completeness_pct: 60.0,
      rating: "MEDIUM_QUALITY",
      missing_fields: ["victim_device_imei_fingerprint", "realtime_mule_kyc_status"]
    },
    final_confidence: 0.4971,
    alert_action: "MAINTAIN_ALERT",
    alert_action_reason: "Evidence-based audit supports operational alert status.",
    why_prediction_may_be_wrong: [
      "Mule cash out may occur via physical merchant POS purchasing or crypto P2P ramps instead of target ATM network."
    ]
  },
  disclaimer: "AI predictions are risk intelligence indicators to assist law enforcement dispatch. They are not proof of criminal guilt."
};

const DEFAULT_COMPLAINTS = [
  { complaint_ack_id: 'ACK20260900001', crime_category: 'UPI_FRAUD', loss_amount: 75000, origin_hub: 'Delhi_NCR' },
  { complaint_ack_id: 'ACK20260900002', crime_category: 'INVESTMENT_SCAM', loss_amount: 150000, origin_hub: 'Jamtara_Deoghar' },
  { complaint_ack_id: 'ACK20260900003', crime_category: 'JOB_SCAM', loss_amount: 50000, origin_hub: 'Mewat_Region' },
];

interface PredictionDetailsViewProps {
  initialAckId?: string;
}

export default function PredictionDetailsView({ initialAckId }: PredictionDetailsViewProps) {
  const [complaints, setComplaints] = useState<any[]>(DEFAULT_COMPLAINTS);
  const [selectedAck, setSelectedAck] = useState<string>(initialAckId || 'ACK20260900001');
  const [selectedHub, setSelectedHub] = useState<string>('Delhi_NCR');
  const [category, setCategory] = useState<string>('UPI_FRAUD');
  const [lossAmount, setLossAmount] = useState<number>(75000);
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.2090);

  const [loading, setLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<PredictionResponse>(DEFAULT_FORECAST);

  useEffect(() => {
    async function initComplaints() {
      const data = await fetchComplaints(undefined, 10);
      if (data && data.length > 0) {
        setComplaints(data);
        const targetAck = initialAckId || data[0].complaint_ack_id;
        setSelectedAck(targetAck);
        const item = data.find((c) => c.complaint_ack_id === targetAck) || data[0];
        setCategory(item.crime_category || 'UPI_FRAUD');
        setLossAmount(item.loss_amount || 75000);
        setSelectedHub(item.origin_hub || 'Delhi_NCR');
        if (item.latitude) setLat(item.latitude);
        if (item.longitude) setLng(item.longitude);

        runForecastForPayload(targetAck, item.origin_hub || 'Delhi_NCR', item.latitude || 28.6139, item.longitude || 77.2090, item.crime_category || 'UPI_FRAUD', item.loss_amount || 75000);
      }
    }
    initComplaints();
  }, [initialAckId]);

  const runForecastForPayload = async (ack: string, hub: string, latitude: number, longitude: number, cat: string, loss: number) => {
    setLoading(true);
    const res = await generatePredictionForecast({
      complaint_ack_id: ack,
      origin_hub: hub,
      latitude,
      longitude,
      crime_category: cat,
      loss_amount: loss,
    });
    setLoading(false);
    if (res) setForecast(res);
  };

  const handleComplaintChange = (ackId: string) => {
    setSelectedAck(ackId);
    const item = complaints.find((c) => c.complaint_ack_id === ackId) || complaints[0] || DEFAULT_COMPLAINTS[0];
    setCategory(item.crime_category || 'UPI_FRAUD');
    setLossAmount(item.loss_amount || 75000);
    setSelectedHub(item.origin_hub || 'Delhi_NCR');
    if (item.latitude) setLat(item.latitude);
    if (item.longitude) setLng(item.longitude);
    runForecastForPayload(ackId, item.origin_hub || 'Delhi_NCR', item.latitude || 28.6139, item.longitude || 77.2090, item.crime_category || 'UPI_FRAUD', item.loss_amount || 75000);
  };

  const currentForecast = forecast || DEFAULT_FORECAST;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Withdrawal Prediction Details (WHERE • WHEN • WHY • CONFIDENCE)
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Detailed Spatial-Temporal ML Forecast & Decision-Support Feature Attribution Matrix
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold uppercase">Select Case:</span>
          <select
            value={selectedAck}
            onChange={(e) => handleComplaintChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          >
            {complaints.map((c) => (
              <option key={c.complaint_ack_id} value={c.complaint_ack_id}>
                {c.complaint_ack_id} ({c.crime_category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500 font-mono text-sm">Computing prediction model pipeline...</div>
      ) : (
        <div className="space-y-6">
          {/* Safeguard Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
            <div>
              <strong className="block font-bold uppercase text-amber-800 mb-0.5">
                Decision Support Safeguard Notice
              </strong>
              {currentForecast.disclaimer}
            </div>
          </div>

          {/* 4 CORE DISPLAY SECTIONS: WHERE, WHEN, WHY, CONFIDENCE (Light Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* WHERE */}
            <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                WHERE (Target ATM Location)
              </span>
              <h4 className="text-lg font-extrabold text-slate-900">
                {currentForecast.location_predictions[0]?.bank_name || 'Target ATM'}
              </h4>
              <p className="text-xs text-slate-600">
                {currentForecast.location_predictions[0]?.address}, {currentForecast.location_predictions[0]?.city}
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                <div>Proximity: <strong className="text-blue-700">{currentForecast.location_predictions[0]?.distance_km} km</strong> offset</div>
                <div>Coordinates: {currentForecast.location_predictions[0]?.latitude.toFixed(4)}, {currentForecast.location_predictions[0]?.longitude.toFixed(4)}</div>
              </div>
            </div>

            {/* WHEN */}
            <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                WHEN (Predicted Time Window)
              </span>
              <h4 className="text-lg font-extrabold text-slate-900">
                {currentForecast.predicted_time_window}
              </h4>
              <p className="text-xs text-emerald-700 font-mono font-bold">
                Post-incident PDF peak window
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                <div>Probability Density: <strong className="text-emerald-700">{(currentForecast.time_probability * 100).toFixed(1)}% Fit</strong></div>
                <div>Window: {new Date(currentForecast.window_start_timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(currentForecast.window_end_timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
            </div>

            {/* WHY (SHAP) */}
            <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                WHY (Top Feature Drivers)
              </span>
              <div className="space-y-1.5 pt-1">
                {currentForecast.explainability?.positive_contributions?.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 truncate max-w-[140px] font-medium">{feat.signal || feat.feature}</span>
                    <span className="text-emerald-700 font-mono font-bold">+{feat.impact_pct}%</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                Calculated via SHAP explainability engine
              </div>
            </div>

            {/* CONFIDENCE */}
            <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                CONFIDENCE (Certainty Index)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-amber-800 font-mono">
                  {(currentForecast.confidence * 100).toFixed(1)}%
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {currentForecast.risk_level}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                <div>Model Prob: <strong className="text-blue-700">{((currentForecast.model_probability || 0.71) * 100).toFixed(1)}%</strong></div>
                <div>Operational Risk: <strong className="text-amber-800">{((currentForecast.operational_risk_score || 0.72) * 100).toFixed(0)}/100</strong></div>
              </div>
            </div>
          </div>

          {/* AI Red-Team Challenge Panel (Light Theme) */}
          {currentForecast.redteam_challenge && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  AI Red-Team Challenge Audit
                </h4>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded uppercase">
                  {currentForecast.redteam_challenge.alert_action}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 block uppercase text-[10px]">Supporting Signals</span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {currentForecast.redteam_challenge.supporting_evidence.map((ev, idx) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/60 border border-red-200 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-red-800 block uppercase text-[10px]">Contradicting Signals</span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {currentForecast.redteam_challenge.contradicting_evidence.map((ev, idx) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
