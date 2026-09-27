'use client';

import { useState, useEffect } from 'react';
import { generatePredictionForecast, fetchComplaints, PredictionResponse } from '@/lib/api';

export default function PredictionConsole() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedAck, setSelectedAck] = useState<string>('');
  const [selectedHub, setSelectedHub] = useState<string>('Delhi_NCR');
  const [category, setCategory] = useState<string>('UPI_FRAUD');
  const [lossAmount, setLossAmount] = useState<number>(75000);
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.2090);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<PredictionResponse | null>(null);

  const HUBS = [
    { name: 'Delhi_NCR', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai_Metro', lat: 19.0760, lng: 72.8777 },
    { name: 'Bengaluru_Tech', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad_Cyber', lat: 17.3850, lng: 78.4867 },
    { name: 'Jamtara_Deoghar', lat: 24.2167, lng: 86.8000 },
    { name: 'Mewat_Region', lat: 28.0000, lng: 77.0000 },
    { name: 'Kolkata_East', lat: 22.5726, lng: 88.3639 },
  ];

  useEffect(() => {
    async function loadSampleComplaints() {
      const data = await fetchComplaints(undefined, 15);
      setComplaints(data);
      if (data.length > 0) {
        setSelectedAck(data[0].complaint_ack_id);
      }
    }
    loadSampleComplaints();
  }, []);

  const handleSelectComplaint = (ackId: string) => {
    setSelectedAck(ackId);
    const item = complaints.find((c) => c.complaint_ack_id === ackId);
    if (item) {
      setCategory(item.crime_category || 'UPI_FRAUD');
      setLossAmount(item.loss_amount || 50000);
      setSelectedHub(item.origin_hub || 'Delhi_NCR');
      if (item.latitude) setLat(item.latitude);
      if (item.longitude) setLng(item.longitude);
    }
  };

  const handleHubChange = (hubName: string) => {
    setSelectedHub(hubName);
    const found = HUBS.find((h) => h.name === hubName);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
    }
  };

  const runForecast = async () => {
    setLoading(true);
    const ackId = selectedAck || `ACK_SIM_${Math.floor(Math.random() * 90000 + 10000)}`;
    const payload = {
      complaint_ack_id: ackId,
      origin_hub: selectedHub,
      latitude: lat,
      longitude: lng,
      crime_category: category,
      loss_amount: lossAmount,
    };

    const res = await generatePredictionForecast(payload);
    setLoading(false);
    if (res) {
      setForecast(res);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Input Panel */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <h3 className="text-lg font-bold text-slate-900">Complaint Input Parameters</h3>
        </div>

        <div className="space-y-4 text-sm">
          {complaints.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Quick Select Synthetic Complaint
              </label>
              <select
                value={selectedAck}
                onChange={(e) => handleSelectComplaint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {complaints.map((c) => (
                  <option key={c.complaint_ack_id} value={c.complaint_ack_id}>
                    {c.complaint_ack_id} ({c.crime_category} - ₹{c.loss_amount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Cybercrime Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm text-xs"
            >
              <option value="UPI_FRAUD">UPI Fraud</option>
              <option value="INVESTMENT_SCAM">Investment Scam</option>
              <option value="JOB_SCAM">Job Scam</option>
              <option value="IMPERSONATION_I4C_POLICE">Impersonation (Police / I4C)</option>
              <option value="CUSTOMER_CARE_PHISHING">Customer Care Phishing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Geographic Region Hub
            </label>
            <select
              value={selectedHub}
              onChange={(e) => handleHubChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm text-xs"
            >
              {HUBS.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Loss Amount (INR ₹)
            </label>
            <input
              type="number"
              value={lossAmount}
              onChange={(e) => setLossAmount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm text-xs font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={runForecast}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-xs"
          >
            {loading ? 'Computing Fused Risk Signals...' : '⚡ Execute 6-Component Risk Fusion'}
          </button>
        </div>
      </div>

      {/* Results Display Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {!forecast ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center my-auto">
            <h4 className="text-base font-bold text-slate-700">No Risk Fusion Forecast Run Yet</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Click "Execute 6-Component Risk Fusion" to run auditable multi-signal scoring.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Disclaimer Safeguard Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
              <div>
                <strong className="block font-bold uppercase text-amber-800 mb-0.5">
                  Decision Support & Risk Intelligence Safeguard
                </strong>
                {forecast.disclaimer}
              </div>
            </div>

            {/* Fused Operational Risk & Model Probability Cards Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Model Probability</span>
                <span className="text-xl font-extrabold text-blue-700 font-mono">
                  {((forecast.model_probability || forecast.confidence) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Pure ML Likelihood</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Operational Risk</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-amber-800 font-mono">
                    {((forecast.operational_risk_score || forecast.risk_score) * 100).toFixed(0)}/100
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    forecast.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {forecast.risk_level}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fused Score</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Prediction Convergence</span>
                <span className="text-xl font-extrabold text-emerald-700 font-mono">
                  {((forecast.prediction_convergence || 0.85) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Multi-Source Alignment</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Model Confidence</span>
                <span className="text-xl font-extrabold text-indigo-700 font-mono">
                  {(forecast.confidence * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Statistical Certainty</span>
              </div>
            </div>

            {/* Auditable 6-Component Signal Weighting Matrix */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Auditable 6-Component Risk Signal Weightings
                </h4>
                <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-bold">
                  {forecast.auditable_config?.config_version || 'fusion_config.json v1.0.0'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forecast.supporting_signals?.map((sig, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{sig.signal_name}</span>
                      <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Weight: {sig.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{sig.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI RED-TEAM CHALLENGE & ADVERSARIAL AUDIT PANEL */}
            {forecast.redteam_challenge && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      AI Red-Team Challenge & Adversarial Audit
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
                      forecast.redteam_challenge.alert_action === 'DOWNGRADED_BY_REDTEAM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {forecast.redteam_challenge.alert_action}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                  {forecast.redteam_challenge.alert_action_reason}
                </p>

                {/* Audit Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Data Quality</span>
                    <span className="text-base font-extrabold text-blue-700 font-mono mt-0.5 block">
                      {forecast.redteam_challenge.data_quality.completeness_pct}% Completeness
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Rating: {forecast.redteam_challenge.data_quality.rating}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Audited Final Confidence</span>
                    <span className="text-base font-extrabold text-indigo-700 font-mono mt-0.5 block">
                      {(forecast.redteam_challenge.final_confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">Red-Team Recalculated</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Missing Data Fields</span>
                    <span className="text-xs font-mono text-amber-800 mt-0.5 block truncate font-bold">
                      {forecast.redteam_challenge.data_quality.missing_fields.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Supporting vs Contradicting Evidence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-lg space-y-2">
                    <span className="font-bold text-emerald-800 block uppercase text-[10px] tracking-wider">
                      Supporting Evidence
                    </span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {forecast.redteam_challenge.supporting_evidence.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-red-50/60 border border-red-200 p-3.5 rounded-lg space-y-2">
                    <span className="font-bold text-red-800 block uppercase text-[10px] tracking-wider">
                      Contradicting Evidence
                    </span>
                    <ul className="space-y-1 text-slate-700 list-disc list-inside">
                      {forecast.redteam_challenge.contradicting_evidence.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Why Prediction May Be Wrong Adversarial Box */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs space-y-2">
                  <span className="font-bold text-red-700 uppercase tracking-wider text-[10px] block">
                    Why This Prediction May Be Wrong (Adversarial Challenge View)
                  </span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside font-medium">
                    {forecast.redteam_challenge.why_prediction_may_be_wrong.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Section 1: WHEN Prediction Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Predicted Time Window (WHEN)
                  </h4>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{forecast.predicted_time_window}</p>
                </div>
                <div className="text-xs text-slate-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-bold shadow-sm">
                  Window: {new Date(forecast.window_start_timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(forecast.window_end_timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>

            {/* Section 2: WHERE Location Predictions */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Ranked Location Candidates (WHERE)</span>
                <span className="text-xs text-slate-500 font-normal">Ordered by Fused Location Probability</span>
              </h4>

              <div className="space-y-3">
                {forecast.location_predictions?.map((atm, i) => (
                  <div key={atm.atm_id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                          #{i + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{atm.bank_name} ({atm.atm_id})</h5>
                          <p className="text-xs text-slate-500">{atm.address}, {atm.city}</p>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
                        {(atm.location_probability * 100).toFixed(1)}% Prob
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-200 font-mono">
                      <span>Proximity: <strong className="text-blue-700">{atm.distance_km} km</strong> away</span>
                      <span>SRID 4326: {atm.latitude.toFixed(4)}, {atm.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
