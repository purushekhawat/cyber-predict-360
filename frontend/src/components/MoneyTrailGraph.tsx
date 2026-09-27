'use client';

import { useState, useEffect } from 'react';
import { fetchComplaintGraph, fetchAccountGraphAnalytics, ComplaintGraphResponse, GraphAnalyticsResponse } from '@/lib/api';

export default function MoneyTrailGraph() {
  const [ackId, setAckId] = useState<string>('ACK20260900001');
  const [graphData, setGraphData] = useState<ComplaintGraphResponse | null>(null);
  const [analytics, setAnalytics] = useState<GraphAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadGraphForComplaint = async (targetAck: string) => {
    setLoading(true);
    const gRes = await fetchComplaintGraph(targetAck);
    setGraphData(gRes);

    if (gRes && gRes.nodes) {
      const muleNode = gRes.nodes.find((n: any) => n.label === 'Account' && n.properties?.type?.includes('MULE'));
      const targetAcc = muleNode ? muleNode.id : (gRes.nodes[0]?.id || 'MUL1_ACC_2001');
      const aRes = await fetchAccountGraphAnalytics(targetAcc);
      setAnalytics(aRes);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadGraphForComplaint(ackId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              Neo4j Financial Relationship Graph
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono px-2.5 py-0.5 rounded-full uppercase font-bold">
                8 Node Types • 6 Relationship Types
              </span>
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Models complex financial networks: (Victim) ➔ REPORTED_IN ➔ (Complaint), (Account) ➔ USED ➔ (Device), (Account) ➔ WITHDRAWN_AT ➔ (ATM)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ackId}
              onChange={(e) => setAckId(e.target.value)}
              placeholder="ACK20260900001"
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 shadow-sm"
            />
            <button
              onClick={() => loadGraphForComplaint(ackId)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Query Graph
            </button>
          </div>
        </div>

        {/* Node Types Legend (Light Theme) */}
        <div className="flex items-center gap-3 flex-wrap mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">Graph Node Types:</span>
          <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">Complaint</span>
          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">Victim</span>
          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">Account</span>
          <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">Device</span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold">UpiId</span>
          <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 font-bold">ATM</span>
          <span className="px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 font-bold">Location</span>
        </div>

        {/* Graph Nodes & Edges Visual Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-mono">Querying Neo4j Graph Network...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Relationship Edge</th>
                  <th className="py-3 px-4">Source Node (From)</th>
                  <th className="py-3 px-4">Target Node (To)</th>
                  <th className="py-3 px-4">Relationship Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {graphData?.edges?.map((edge, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        #{i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-bold">{edge.source}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{edge.target}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase">
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

      {/* Graph Derived Risk Features & Analytics Panel (Light Theme) */}
      {analytics && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
            <span>Graph-Derived Risk Analytics (Account: {analytics.account_number})</span>
            <span className="text-xs text-slate-500 font-mono">Neutral Risk Intelligence</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Account Degree</span>
              <span className="text-2xl font-extrabold text-blue-700 font-mono mt-1 block">{analytics.account_degree}</span>
              <span className="text-[10px] text-slate-500 block">In-Degree + Out-Degree</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Connected Complaints</span>
              <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">{analytics.connected_complaint_count}</span>
              <span className="text-[10px] text-slate-500 block">Victim Complaints Linked</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Transaction Hops</span>
              <span className="text-2xl font-extrabold text-indigo-700 font-mono mt-1 block">{analytics.transaction_hops} Hops</span>
              <span className="text-[10px] text-slate-500 block">Path Depth to Cash Out</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Connected Accounts</span>
              <span className="text-2xl font-extrabold text-amber-700 font-mono mt-1 block">{analytics.connected_account_count}</span>
              <span className="text-[10px] text-slate-500 block">Distinct Network Peers</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Neutral Suspicious Cluster Indicators:</span>
            <div className="flex flex-wrap gap-2">
              {analytics.suspicious_cluster_indicators?.map((ind, idx) => (
                <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1.5 rounded-lg font-bold">
                  ⚠️ {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
