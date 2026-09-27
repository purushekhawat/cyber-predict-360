'use client';

import { useState, useEffect } from 'react';
import { fetchComplaints, generatePredictionForecast } from '@/lib/api';

const DEFAULT_REDTEAM_CHALLENGE = {
  prediction: "Withdrawal forecast at Punjab National Bank (ATM_0098)",
  supporting_evidence: [
    "High spatial candidate likelihood (75.9%)",
    "Close spatial proximity candidate (2.03 km)",
    "Strong time-decay PDF alignment (67.2%)",
    "High financial loss magnitude (INR 75,000)"
  ],
  contradicting_evidence: [
    "Missing victim device hardware fingerprint verification",
    "Unverified mule account KYC identity status"
  ],
  data_quality: {
    completeness_pct: 60.0,
    rating: "MEDIUM_QUALITY",
    missing_fields: [
      "victim_device_imei_fingerprint",
      "realtime_mule_kyc_status"
    ]
  },
  final_confidence: 0.4971,
  alert_action: "MAINTAIN_ALERT",
  alert_action_reason: "Evidence-based audit supports operational alert status.",
  why_prediction_may_be_wrong: [
    "Mule cash out may occur via physical merchant POS purchasing or crypto P2P ramps instead of target ATM network.",
    "Complaint location GPS reflects victim home address rather than actual fraudster operating origin.",
    "Off-peak incident time may cause delayed manual cash withdrawal outside predicted window."
  ]
};

const DEFAULT_COMPLAINTS = [
  { complaint_ack_id: 'ACK20260900001', crime_category: 'UPI_FRAUD', loss_amount: 75000, origin_hub: 'Delhi_NCR' },
  { complaint_ack_id: 'ACK20260900002', crime_category: 'INVESTMENT_SCAM', loss_amount: 150000, origin_hub: 'Jamtara_Deoghar' },
  { complaint_ack_id: 'ACK20260900003', crime_category: 'JOB_SCAM', loss_amount: 50000, origin_hub: 'Mewat_Region' },
];

export default function EvidenceAuditView() {
  const [complaints, setComplaints] = useState<any[]>(DEFAULT_COMPLAINTS);
  const [selectedAck, setSelectedAck] = useState<string>('ACK20260900001');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchComplaints(undefined, 10);
      if (data && data.length > 0) {
        setComplaints(data);
        setSelectedAck(data[0].complaint_ack_id);
        const fRes = await generatePredictionForecast({
          complaint_ack_id: data[0].complaint_ack_id,
          origin_hub: data[0].origin_hub || 'Delhi_NCR',
          latitude: data[0].latitude || 28.6139,
          longitude: data[0].longitude || 77.2090,
          crime_category: data[0].crime_category || 'UPI_FRAUD',
          loss_amount: data[0].loss_amount || 75000,
        });
        if (fRes) setForecast(fRes);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectCase = async (ackId: string) => {
    setSelectedAck(ackId);
    setLoading(true);
    const item = complaints.find((c) => c.complaint_ack_id === ackId) || complaints[0] || DEFAULT_COMPLAINTS[0];
    const fRes = await generatePredictionForecast({
      complaint_ack_id: ackId,
      origin_hub: item.origin_hub || 'Delhi_NCR',
      latitude: item.latitude || 28.6139,
      longitude: item.longitude || 77.2090,
      crime_category: item.crime_category || 'UPI_FRAUD',
      loss_amount: item.loss_amount || 75000,
    });
    if (fRes) setForecast(fRes);
    setLoading(false);
  };

  const redteam = forecast?.redteam_challenge || DEFAULT_REDTEAM_CHALLENGE;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            AI Red-Team Challenge & Evidence Audit Trail
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Data Quality Completeness Audit, Conflicting Signals & Adversarial Error Scenario Review
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold uppercase">Case Ack ID:</span>
          <select
            value={selectedAck}
            onChange={(e) => handleSelectCase(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500 shadow-sm"
          >
            {complaints.map((c) => (
              <option key={c.complaint_ack_id} value={c.complaint_ack_id}>
                {c.complaint_ack_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Evaluating evidence audit trail...</div>
      ) : (
        <div className="space-y-6">
          {/* Data Quality Completeness Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Data Completeness Score</span>
              <span className="text-3xl font-extrabold text-blue-700 font-mono mt-1 block">
                {redteam.data_quality?.completeness_pct}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Rating: {redteam.data_quality?.rating}</span>
            </div>

            <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Audited Final Confidence</span>
              <span className="text-3xl font-extrabold text-indigo-700 font-mono mt-1 block">
                {(redteam.final_confidence * 100).toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Evidence-Weighted Adjustment</span>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Red-Team Alert Decision</span>
              <span className="text-xl font-extrabold text-amber-800 font-mono mt-2 block uppercase">
                {redteam.alert_action}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{redteam.alert_action_reason}</span>
            </div>
          </div>

          {/* Missing Data Fields Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 shadow-sm">
            <strong className="font-bold uppercase block text-amber-800 mb-1">
              Missing Field Data Dependencies Detected
            </strong>
            <ul className="list-disc list-inside space-y-1 font-mono text-slate-700">
              {redteam.data_quality?.missing_fields?.map((field: string, idx: number) => (
                <li key={idx}>{field}</li>
              ))}
            </ul>
          </div>

          {/* Supporting vs Contradicting Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-white border border-emerald-200 rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs flex items-center gap-2">
                Supporting Evidence Signals
              </h4>
              <ul className="space-y-2 text-slate-700 list-disc list-inside font-mono">
                {redteam.supporting_evidence?.map((ev: string, idx: number) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="font-bold text-red-800 uppercase tracking-wider text-xs flex items-center gap-2">
                Contradicting / Conflicting Signals
              </h4>
              <ul className="space-y-2 text-slate-700 list-disc list-inside font-mono">
                {redteam.contradicting_evidence?.map((ev: string, idx: number) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Why Prediction May Be Wrong Adversarial Box */}
          <div className="bg-white border border-red-200 rounded-xl p-5 space-y-3 text-xs shadow-sm">
            <h4 className="font-bold text-red-800 uppercase tracking-wider text-xs flex items-center gap-2">
              Why This Prediction May Be Wrong (Adversarial Error Scenarios)
            </h4>
            <ul className="space-y-2 text-slate-700 list-disc list-inside leading-relaxed font-medium">
              {redteam.why_prediction_may_be_wrong?.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
