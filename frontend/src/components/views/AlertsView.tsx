'use client';

import { useState } from 'react';
import { BellRing, Send, Building, CheckCircle2, XCircle } from 'lucide-react';

export default function AlertsView() {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [dispatchedAlerts, setDispatchedAlerts] = useState<Record<string, string>>({});

  const MOCK_ALERTS = [
    { id: 'ALT_001', ackId: 'ACK20260900001', atm: 'Punjab National Bank (ATM_0098)', hub: 'Delhi_NCR', riskScore: 0.88, severity: 'CRITICAL', timeWindow: '1.18 - 3.68 hrs', distance: '2.03 km' },
    { id: 'ALT_002', ackId: 'ACK20260900002', atm: 'State Bank of India (ATM_0042)', hub: 'Jamtara_Deoghar', riskScore: 0.84, severity: 'CRITICAL', timeWindow: '0.85 - 2.50 hrs', distance: '1.45 km' },
    { id: 'ALT_003', ackId: 'ACK20260900003', atm: 'HDFC Bank (ATM_0112)', hub: 'Mewat_Region', riskScore: 0.79, severity: 'CRITICAL', timeWindow: '1.50 - 4.10 hrs', distance: '2.80 km' },
    { id: 'ALT_004', ackId: 'ACK20260900004', atm: 'ICICI Bank (ATM_0076)', hub: 'Mumbai_Metro', riskScore: 0.68, severity: 'HIGH', timeWindow: '2.10 - 5.00 hrs', distance: '3.10 km' },
    { id: 'ALT_005', ackId: 'ACK20260900005', atm: 'Axis Bank (ATM_0021)', hub: 'Bengaluru_Tech', riskScore: 0.64, severity: 'HIGH', timeWindow: '2.40 - 5.50 hrs', distance: '3.45 km' },
    { id: 'ALT_006', ackId: 'ACK20260900006', atm: 'Canara Bank (ATM_0055)', hub: 'Hyderabad_Cyber', riskScore: 0.58, severity: 'HIGH', timeWindow: '3.00 - 6.00 hrs', distance: '4.10 km' },
  ];

  const handleAction = (alertId: string, actionName: string) => {
    setDispatchedAlerts((prev) => ({ ...prev, [alertId]: actionName }));
  };

  const filtered = MOCK_ALERTS.filter((a) => filterSeverity === 'ALL' || a.severity === filterSeverity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Operational Alert Dispatch & Field Interception Feed
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Real-Time Law Enforcement Dispatch Queue for High-Likelihood Cash Withdrawal ATM Hotspots
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-bold uppercase">Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Cards */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const actionStatus = dispatchedAlerts[alert.id];
          return (
            <div
              key={alert.id}
              className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                alert.severity === 'CRITICAL' ? 'border-red-300 bg-red-50/10' : 'border-amber-300 bg-amber-50/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {alert.severity} PRIORITY
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-700">{alert.ackId}</span>
                    <span className="text-xs text-slate-500">({alert.hub})</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{alert.atm}</h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-600 pt-1">
                    <span>Predicted Window: <strong className="text-emerald-700">{alert.timeWindow}</strong></span>
                    <span>Proximity: <strong className="text-blue-700">{alert.distance}</strong></span>
                    <span>Fused Risk: <strong className="text-amber-800">{(alert.riskScore * 100).toFixed(0)}/100</strong></span>
                  </div>
                </div>

                {/* Dispatch Action Buttons */}
                <div className="flex items-center gap-2">
                  {actionStatus ? (
                    <span className="px-3.5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionStatus}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(alert.id, 'FIELD UNIT DISPATCHED')}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch Field Unit
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'BANK NODAL NOTIFIED')}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Building className="w-3.5 h-3.5" /> Notify Bank Nodal
                      </button>
                      <button
                        onClick={() => handleAction(alert.id, 'ALERT SUPPRESSED')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-400" /> Suppress
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

