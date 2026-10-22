'use client';

import { useState, useEffect } from 'react';
import { runCounterfactualSimulation, fetchComplaints, CounterfactualResponse } from '@/lib/api';

export default function CounterfactualStudio() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedAck, setSelectedAck] = useState<string>('ACK20260900001');
  const [selectedHub, setSelectedHub] = useState<string>('Delhi_NCR');
  const [category, setCategory] = useState<string>('UPI_FRAUD');
  const [baseAmount, setBaseAmount] = useState<number>(50000);
  const [addAmount, setAddAmount] = useState<number>(100000);
  const [extraHops, setExtraHops] = useState<number>(1);
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.2090);

  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<CounterfactualResponse | null>(null);

  useEffect(() => {
    async function loadSampleComplaints() {
      const data = await fetchComplaints(undefined, 10);
      setComplaints(data);
      if (data.length > 0) {
        setSelectedAck(data[0].complaint_ack_id);
        setBaseAmount(data[0].loss_amount || 50000);
      }
    }
    loadSampleComplaints();
  }, []);

  const handleSelectComplaint = (ackId: string) => {
    setSelectedAck(ackId);
    const item = complaints.find((c) => c.complaint_ack_id === ackId);
    if (item) {
      setBaseAmount(item.loss_amount || 50000);
      setSelectedHub(item.origin_hub || 'Delhi_NCR');
      setCategory(item.crime_category || 'UPI_FRAUD');
      if (item.latitude) setLat(item.latitude);
      if (item.longitude) setLng(item.longitude);
    }
  };

  const handleExecuteSimulation = async () => {
    setLoading(true);
    const res = await runCounterfactualSimulation({
      complaint_ack_id: selectedAck,
      origin_hub: selectedHub,
      latitude: lat,
      longitude: lng,
      crime_category: category,
      loss_amount: baseAmount,
      hypothetical_additional_amount: addAmount,
      hypothetical_extra_hops: extraHops,
    });
    setLoading(false);
    if (res) {
      setSimResult(res);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Simulation Scenario Controls Panel */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></span>
          <h3 className="text-lg font-extrabold text-slate-900">Hypothetical Scenario Controls</h3>
        </div>

        <div className="space-y-4 text-sm">
          {complaints.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Select Baseline Complaint Ack ID
              </label>
              <select
                value={selectedAck}
                onChange={(e) => handleSelectComplaint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-xs shadow-sm"
              >
                {complaints.map((c) => (
                  <option key={c.complaint_ack_id} value={c.complaint_ack_id}>
                    {c.complaint_ack_id} (Base: ₹{c.loss_amount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Base Loss Amount (INR ₹)
            </label>
            <input
              type="number"
              value={baseAmount}
              onChange={(e) => setBaseAmount(Number(e.target.value))}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono text-xs"
              readOnly
            />
          </div>

          {/* HYPOTHETICAL MODIFICATION CONTROLS */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 block">
              Hypothetical Modifications
            </span>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Additional Transfer Amount (INR ₹)
              </label>
              <input
                type="number"
                step="10000"
                value={addAmount}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                className="w-full bg-white border border-indigo-300 rounded-lg px-3 py-2 text-emerald-700 font-mono font-bold text-xs shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Additional Transfer Hops
              </label>
              <select
                value={extraHops}
                onChange={(e) => setExtraHops(Number(e.target.value))}
                className="w-full bg-white border border-indigo-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs shadow-sm"
              >
                <option value={1}>+1 Transfer Hop (Mule L1 ➔ Mule L2)</option>
                <option value={2}>+2 Transfer Hops (Mule L1 ➔ Mule L2 ➔ Kingpin)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleExecuteSimulation}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 text-xs"
          >
            {loading ? 'Running In-Memory Counterfactual Engine...' : 'Execute Counterfactual Simulation'}
          </button>
        </div>
      </div>

      {/* Simulation Comparison Results Panel */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {!simResult ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-12 text-center my-auto">
            <h4 className="text-base font-bold text-slate-700">No Counterfactual Scenario Simulated</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Configure hypothetical transaction modifications on the left and click "Execute Counterfactual Simulation".
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Safety Non-Mutation Notice Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wide uppercase">{simResult.simulation_notice}</span>
              </div>
              <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold">
                NON-MUTATING
              </span>
            </div>

            {/* Risk Delta Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Baseline Risk Score</span>
                <span className="text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
                  {((simResult.risk_delta?.score_before || 0) * 100).toFixed(1)}/100
                </span>
                <span className="text-[10px] text-slate-500 block">BEFORE Scenario</span>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Simulated Risk Score</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                  {((simResult.risk_delta?.score_after || 0) * 100).toFixed(1)}/100
                </span>
                <span className="text-[10px] text-slate-500 block">AFTER Scenario</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Risk Delta Shift</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xl font-extrabold font-mono ${
                    (simResult.risk_delta?.delta || 0) >= 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {(simResult.risk_delta?.delta || 0) >= 0 ? '+' : ''}
                    {((simResult.risk_delta?.delta || 0) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded uppercase font-bold">
                    {simResult.risk_delta?.direction}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Comparative Impact</span>
              </div>
            </div>

            {/* Time Window Shift Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Time Window Shift Analysis
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">BEFORE Window:</span>
                  <span className="text-slate-800 font-bold">{simResult.changed_time_window?.before}</span>
                </div>
                <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200">
                  <span className="text-indigo-700 block text-[10px]">AFTER Window:</span>
                  <span className="text-emerald-700 font-bold">{simResult.changed_time_window?.after}</span>
                </div>
              </div>
              <p className="text-slate-600 mt-2 text-[11px] font-medium">{simResult.changed_time_window?.shift_description}</p>
            </div>

            {/* Hotspot Probability Shifts Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                📍 Location Hotspot Probability Shifts
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">ATM Node</th>
                      <th className="py-2.5 px-3">Proximity</th>
                      <th className="py-2.5 px-3">BEFORE Prob %</th>
                      <th className="py-2.5 px-3">AFTER Prob %</th>
                      <th className="py-2.5 px-3">Shift Delta %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {simResult.changed_hotspots?.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{h.bank_name} ({h.atm_id})</td>
                        <td className="py-2.5 px-3 text-slate-500">{h.distance_km} km</td>
                        <td className="py-2.5 px-3 text-slate-500">{(h.probability_before * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{(h.probability_after * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-3 font-bold text-indigo-700">
                          {h.probability_delta >= 0 ? '+' : ''}{(h.probability_delta * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <span className="font-bold text-indigo-700 block mb-1 uppercase tracking-wider">
                Analytical Scenario Explanation
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{simResult.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
