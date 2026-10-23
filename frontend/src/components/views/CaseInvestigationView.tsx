'use client';

import { useState, useEffect } from 'react';
import { fetchComplaints, fetchComplaintGraph } from '@/lib/api';

const DEFAULT_COMPLAINTS = [
  { complaint_ack_id: 'ACK20260900001', crime_category: 'UPI_FRAUD', loss_amount: 75000, origin_hub: 'Delhi_NCR', victim_account_number: 'VIC_ACC_1001', incident_timestamp: '2026-09-04T01:00:00Z' },
  { complaint_ack_id: 'ACK20260900002', crime_category: 'INVESTMENT_SCAM', loss_amount: 150000, origin_hub: 'Jamtara_Deoghar', victim_account_number: 'VIC_ACC_1002', incident_timestamp: '2026-09-04T00:30:00Z' },
  { complaint_ack_id: 'ACK20260900003', crime_category: 'JOB_SCAM', loss_amount: 50000, origin_hub: 'Mewat_Region', victim_account_number: 'VIC_ACC_1003', incident_timestamp: '2026-09-04T00:15:00Z' },
];

const DEFAULT_GRAPH_DATA = {
  complaint_ack_id: 'ACK20260900001',
  total_nodes: 7,
  total_edges: 5,
  edges: [
    { source: 'VIC_ACC_1001', target: 'MUL1_ACC_2001', type: 'TRANSFERRED_TO', amount: 75000, hop_level: 1 },
    { source: 'MUL1_ACC_2001', target: 'MUL2_ACC_0029', type: 'TRANSFERRED_TO', amount: 75000, hop_level: 2 },
    { source: 'MUL2_ACC_0029', target: 'ATM_0098', type: 'WITHDRAWN_AT', amount: 75000, hop_level: 3 },
    { source: 'VIC_ACC_1001', target: 'DEV_1001', type: 'USED', hop_level: 1 },
    { source: 'VIC_ACC_1001', target: 'vic_acc_1001@upi', type: 'CONNECTED_TO', hop_level: 1 },
  ]
};

export default function CaseInvestigationView() {
  const [complaints, setComplaints] = useState<any[]>(DEFAULT_COMPLAINTS);
  const [selectedAck, setSelectedAck] = useState<string>('ACK20260900001');
  const [graphData, setGraphData] = useState<any>(DEFAULT_GRAPH_DATA);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchComplaints(undefined, 15);
      if (data && data.length > 0) {
        setComplaints(data);
        setSelectedAck(data[0].complaint_ack_id);
        const gRes = await fetchComplaintGraph(data[0].complaint_ack_id);
        if (gRes) setGraphData(gRes);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectCase = async (ackId: string) => {
    setSelectedAck(ackId);
    setLoading(true);
    const gRes = await fetchComplaintGraph(ackId);
    if (gRes) setGraphData(gRes);
    setLoading(false);
  };

  const selectedCase = complaints.find((c) => c.complaint_ack_id === selectedAck) || complaints[0] || DEFAULT_COMPLAINTS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Case Deep-Dive & Financial Trail Investigation
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Victim Account Routing, Multi-Hop Layering Timeline & Mule Account Fan-In Density
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
                {c.complaint_ack_id} (₹{c.loss_amount?.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Case Metadata Profile Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Complaint Record
            </h3>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              {selectedCase.crime_category}
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Ack ID:</span>
              <span className="text-blue-700 font-bold">{selectedCase.complaint_ack_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Financial Loss:</span>
              <span className="text-emerald-700 font-bold">₹{selectedCase.loss_amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Origin Hub:</span>
              <span className="text-slate-800 font-bold">{selectedCase.origin_hub}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Victim Account:</span>
              <span className="text-slate-800">{selectedCase.victim_account_number || 'VIC_ACC_1001'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Incident Timestamp:</span>
              <span className="text-slate-600">{new Date(selectedCase.incident_timestamp || Date.now()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Multi-Hop Financial Transfer Network Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Multi-Hop Fund Transfer & Cash-Out Hops
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              {(graphData?.edges?.length || 0)} Graph Edges Tracked
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">Retrieving financial network hops...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Hop Level</th>
                    <th className="py-2.5 px-3">Source Account</th>
                    <th className="py-2.5 px-3">Target Account / ATM</th>
                    <th className="py-2.5 px-3">Transfer Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {(graphData?.edges || DEFAULT_GRAPH_DATA.edges).map((edge: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-blue-700">Hop #{edge.hop_level || i + 1}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{edge.source}</td>
                      <td className="py-2.5 px-3 text-amber-800 font-bold">{edge.target}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] uppercase font-bold">
                          :{edge.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
