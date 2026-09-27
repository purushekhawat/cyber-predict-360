'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Building2, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  AlertOctagon, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  FileSpreadsheet, 
  Search, 
  RefreshCw,
  Clock,
  ExternalLink,
  Ban,
  SlidersHorizontal,
  Download,
  Activity,
  Server,
  MapPin
} from 'lucide-react';

const HotspotMap = dynamic(() => import('@/components/HotspotMap'), { ssr: false });

interface MuleAccount {
  accountNo: string;
  bankName: string;
  holderName: string;
  accountType: 'SAVINGS' | 'CURRENT' | 'CYBER_MULE_SUSPECT';
  riskScore: number;
  ncrpAckId: string;
  lienStatus: 'ACTIVE_LIEN' | 'FREEZE_PENDING' | 'CLEARED' | 'SUSPENDED';
  balanceINR: number;
  flaggedHop: number;
}

const INITIAL_MULE_ACCOUNTS: MuleAccount[] = [
  { accountNo: 'ACC99882211', bankName: 'State Bank of India', holderName: 'Synthetic Mule User A', accountType: 'CYBER-MULE SUSPECT', riskScore: 0.96, ncrpAckId: 'ACK20260900001', lienStatus: 'FREEZE_PENDING', balanceINR: 145000, flaggedHop: 2 },
  { accountNo: 'ACC44331199', bankName: 'Punjab National Bank', holderName: 'Synthetic Mule User B', accountType: 'CYBER-MULE SUSPECT', riskScore: 0.89, ncrpAckId: 'ACK20260900002', lienStatus: 'ACTIVE_LIEN', balanceINR: 78000, flaggedHop: 1 },
  { accountNo: 'ACC77665544', bankName: 'HDFC Bank', holderName: 'Mule Aggregator C', accountType: 'CURRENT', riskScore: 0.78, ncrpAckId: 'ACK20260900003', lienStatus: 'FREEZE_PENDING', balanceINR: 320000, flaggedHop: 3 },
  { accountNo: 'ACC11223344', bankName: 'ICICI Bank', holderName: 'Suspicious Account D', accountType: 'SAVINGS', riskScore: 0.72, ncrpAckId: 'ACK20260900005', lienStatus: 'ACTIVE_LIEN', balanceINR: 52000, flaggedHop: 2 },
];

export default function BankDashboardView() {
  const pathname = usePathname();
  const [accounts, setAccounts] = useState<MuleAccount[]>(INITIAL_MULE_ACCOUNTS);
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // ATM Safeguard Matrix state
  const [cpAtmCap, setCpAtmCap] = useState<number>(10000);
  const [isCpAtmRestricted, setIsCpAtmRestricted] = useState<boolean>(true);
  const [jmtAtmCap, setJmtAtmCap] = useState<number>(5000);

  const handleToggleLien = (accNo: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.accountNo === accNo) {
        const nextStatus = acc.lienStatus === 'ACTIVE_LIEN' ? 'CLEARED' : 'ACTIVE_LIEN';
        const msg = nextStatus === 'ACTIVE_LIEN' 
          ? `Account ${accNo} placed under Instant Regulatory Lien. Debit transactions blocked.`
          : `Lien lifted for Account ${accNo}.`;
        setActionSuccessMsg(msg);
        setTimeout(() => setActionSuccessMsg(null), 3500);
        return { ...acc, lienStatus: nextStatus };
      }
      return acc;
    }));
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchBank = selectedBank === 'ALL' || acc.bankName.includes(selectedBank);
    const matchSearch = acc.accountNo.includes(searchTerm) || acc.ncrpAckId.includes(searchTerm) || acc.holderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBank && matchSearch;
  });

  const totalFrozenBalance = accounts
    .filter(a => a.lienStatus === 'ACTIVE_LIEN')
    .reduce((sum, a) => sum + a.balanceINR, 0);

  // Path-based subviews
  const isLimitsPage = pathname === '/bank/limits';
  const isAnalyticsPage = pathname === '/bank/analytics';
  const isFiuPage = pathname === '/bank/fiu';
  const isNetworkPage = pathname === '/bank/network';
  const isMapPage = pathname === '/bank/map';

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> CYBER-PREDICT 360 • BANK NODAL PORTAL
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-bold">PS ID 26184 • RBI FIU COMPLIANT</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            {isLimitsPage ? 'ATM Cash-Out Caps & Threshold Controls' :
             isAnalyticsPage ? 'Fraud Loss Exposure Analytics' :
             isFiuPage ? 'RBI / FIU SAR Compliance Reporting' :
             isNetworkPage ? 'Inter-Bank Nodal Network Health' :
             isMapPage ? 'Spatial Risk Heatmap Radar' :
             'Bank Nodal Mule Account & ATM Control Desk'}
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Real-Time Mule Account Lien Freezing, ATM Cash-Out Caps & FIU Compliance Safeguards.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => {
              setActionSuccessMsg("Regulatory SAR (Suspicious Activity Report) generated for FIU-IND.");
              setTimeout(() => setActionSuccessMsg(null), 3500);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXPORT FIU SAR REPORT</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="bg-indigo-600 text-white p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* SUB-VIEW MAP: /bank/map (SPATIAL RISK HEATMAP RADAR) */}
      {isMapPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Spatial Risk Heatmap • Bank Nodal ATM Radar
                </h3>
                <p className="text-xs text-slate-500 font-medium">High-density ATM cash-out hot spots, compromised ATM hubs, and real-time loss density.</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[600px]">
              <HotspotMap />
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: /bank/limits (ATM CASH-OUT LIMIT CONTROLS) */}
      {isLimitsPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                Hotspot ATM Withdrawal Cap & Emergency Cash Dispenser Controls
              </h3>
              <p className="text-xs text-slate-500 font-medium">Dynamically adjust max cash-out limit per transaction in high-risk crime zones.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cluster 1 */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Delhi NCR - Connaught Place & Janakpuri</h4>
                    <span className="text-xs text-slate-500 font-mono">9 Predicted High-Risk ATM Terminals</span>
                  </div>
                  <button
                    onClick={() => setIsCpAtmRestricted(!isCpAtmRestricted)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      isCpAtmRestricted ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCpAtmRestricted ? 'CAP ACTIVE' : 'NORMAL LIMIT'}
                  </button>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-900 text-xs">
                    <span>Max Single Cash Withdrawal:</span>
                    <span className="font-mono text-sm text-indigo-700">₹ {cpAtmCap.toLocaleString('en-IN')}</span>
                  </div>

                  <input 
                    type="range" 
                    min={2000}
                    max={25000}
                    step={1000}
                    value={cpAtmCap}
                    onChange={(e) => setCpAtmCap(Number(e.target.value))}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>₹ 2,000 (Strict)</span>
                    <span>₹ 25,000 (Standard)</span>
                  </div>
                </div>
              </div>

              {/* Cluster 2 */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">Jamtara & Deoghar Cyber Crime Hotspot</h4>
                    <span className="text-xs text-slate-500 font-mono">14 High-Density Withdrawal Terminals</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                    STRICT LOCK
                  </span>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between font-bold text-slate-900 text-xs">
                    <span>Max Single Cash Withdrawal:</span>
                    <span className="font-mono text-sm text-red-700">₹ {jmtAtmCap.toLocaleString('en-IN')}</span>
                  </div>

                  <input 
                    type="range" 
                    min={1000}
                    max={15000}
                    step={1000}
                    value={jmtAtmCap}
                    onChange={(e) => setJmtAtmCap(Number(e.target.value))}
                    className="w-full accent-red-700 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>₹ 1,000 (Strict Lock)</span>
                    <span>₹ 15,000 (Capped)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: /bank/analytics (FRAUD LOSS EXPOSURE) */}
      {isAnalyticsPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Inter-Bank Cyber Fraud Loss Exposure & Recovery Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time stats on prevented loss, frozen mule balances, and velocity analysis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="border border-slate-200 rounded-2xl p-5 bg-emerald-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">Total Loss Prevented</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">₹ 1,48,50,000</div>
                <p className="text-xs text-emerald-700 font-medium">Secured across 412 frozen mule accounts</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-blue-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider">Avg Money Trail Hop Velocity</span>
                <div className="text-2xl font-black text-blue-800 font-mono">1.8 Mins / Hop</div>
                <p className="text-xs text-blue-700 font-medium">Rapid UPI mule account transfer speed</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-indigo-50/50 space-y-2">
                <span className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider">Nodal Response SLA</span>
                <div className="text-2xl font-black text-indigo-800 font-mono">99.4% Success</div>
                <p className="text-xs text-indigo-700 font-medium">Automated PKI Lien placement rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: /bank/fiu (RBI / FIU SAR COMPLIANCE) */}
      {isFiuPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  RBI & FIU-IND Statutory Suspicious Activity Report (SAR) Vault
                </h3>
                <p className="text-xs text-slate-500 font-medium">Automated regulatory filing reports for statutory compliance under PMLA 2002.</p>
              </div>

              <button
                onClick={() => setActionSuccessMsg("Statutory FIU-IND XML package generated.")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" /> Export Statutory XML
              </button>
            </div>

            <div className="space-y-4">
              {[
                { sarId: 'SAR-2026-0091', ackId: 'ACK20260900001', accountsCount: 3, totalAmount: 450000, status: 'FILED_FIU_IND', timestamp: '2026-09-27 12:10 IST' },
                { sarId: 'SAR-2026-0092', ackId: 'ACK20260900002', accountsCount: 2, totalAmount: 180000, status: 'PENDING_NODAL_SIGN', timestamp: '2026-09-27 11:30 IST' },
                { sarId: 'SAR-2026-0093', ackId: 'ACK20260900003', accountsCount: 5, totalAmount: 780000, status: 'FILED_FIU_IND', timestamp: '2026-09-27 09:45 IST' },
              ].map((sar) => (
                <div key={sar.sarId} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-slate-50 font-mono text-xs">
                  <div>
                    <span className="font-black text-slate-900 block">{sar.sarId}</span>
                    <span className="text-slate-500">Linked NCRP ACK: {sar.ackId}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-indigo-900 block">₹ {sar.totalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-slate-500">{sar.accountsCount} Mule Accounts</span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {sar.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: /bank/network (BANK NODAL NETWORK NODES) */}
      {isNetworkPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                Inter-Bank Nodal Network Nodes & mTLS Status
              </h3>
              <p className="text-xs text-slate-500 font-medium">Active REST API endpoints for instant mule account debit freeze synchronization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { bank: 'State Bank of India (SBI)', nodeStatus: 'ONLINE', latency: '42ms', mtlsCert: 'VALID (TLS 1.3)', lastSync: '2 secs ago' },
                { bank: 'Punjab National Bank (PNB)', nodeStatus: 'ONLINE', latency: '58ms', mtlsCert: 'VALID (TLS 1.3)', lastSync: '5 secs ago' },
                { bank: 'HDFC Bank', nodeStatus: 'ONLINE', latency: '35ms', mtlsCert: 'VALID (TLS 1.3)', lastSync: '1 sec ago' },
                { bank: 'ICICI Bank', nodeStatus: 'ONLINE', latency: '48ms', mtlsCert: 'VALID (TLS 1.3)', lastSync: '4 secs ago' },
              ].map((net, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-mono text-xs space-y-2">
                  <div className="flex justify-between items-start font-sans">
                    <h4 className="font-black text-slate-900">{net.bank}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {net.nodeStatus}
                    </span>
                  </div>

                  <div className="text-slate-600 text-[11px] space-y-0.5">
                    <div>mTLS Security: <strong className="text-emerald-700">{net.mtlsCert}</strong></div>
                    <div>API Latency: {net.latency}</div>
                    <div>Last Sync: {net.lastSync}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT SUB-VIEW: /bank (MULE ACCOUNT LIEN QUEUE) */}
      {!isLimitsPage && !isAnalyticsPage && !isFiuPage && !isNetworkPage && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Frozen Lien Funds</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700 font-mono">₹ {totalFrozenBalance.toLocaleString('en-IN')}</span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">SECURED</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Prevented cash siphoning out</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Pending Freeze Requests</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-600">2 ACCOUNTS</span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">ACTION REQD</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Incoming NCRP Complaint Notices</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">ATM Cash Cap Status</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-700 font-mono">₹ 10,000/Txn</span>
                <span className="text-[11px] font-bold text-blue-600">HOTSPOT CAP</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Connaught Place & Janakpuri ATMs</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Bank Inter-Nodal SLA</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 font-mono">4.8 Mins</span>
                <span className="text-[11px] font-bold text-emerald-600">99.4% SLA</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Automated Lien response time</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Mule Account Lien Management Queue */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Table Header Controls */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      Incoming NCRP Mule Account Freeze & Lien Placement Queue
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">Immediate freeze control for identified financial money trail hops.</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <select 
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-800"
                    >
                      <option value="ALL">All Partner Banks</option>
                      <option value="State Bank">SBI</option>
                      <option value="Punjab National">PNB</option>
                      <option value="HDFC">HDFC</option>
                      <option value="ICICI">ICICI</option>
                    </select>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input 
                        type="text"
                        placeholder="Search Account / ACK..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Mule Account / Bank</th>
                        <th className="p-3">Holder Name</th>
                        <th className="p-3">NCRP ACK ID</th>
                        <th className="p-3">Balance (₹)</th>
                        <th className="p-3">Risk Score</th>
                        <th className="p-3">Lien Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredAccounts.map((acc) => {
                        const isLienActive = acc.lienStatus === 'ACTIVE_LIEN';
                        return (
                          <tr key={acc.accountNo} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-extrabold text-slate-900 block">{acc.accountNo}</span>
                              <span className="text-[10px] text-indigo-700 font-bold">{acc.bankName}</span>
                            </td>
                            <td className="p-3 text-slate-700">
                              <div>{acc.holderName}</div>
                              <span className="text-[10px] font-mono text-slate-500">{acc.accountType}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-blue-900">
                              {acc.ncrpAckId}
                              <span className="text-[10px] text-slate-500 block">Hop level {acc.flaggedHop}</span>
                            </td>
                            <td className="p-3 font-mono font-extrabold text-slate-900">
                              ₹ {acc.balanceINR.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                acc.riskScore >= 0.85 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {(acc.riskScore * 100).toFixed(0)}% Risk
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleLien(acc.accountNo)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isLienActive 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                                }`}
                              >
                                {isLienActive ? (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Lien Active (Click to Lift)</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Place Instant Lien</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Col: High-Risk ATM Withdrawal Safeguard Controls */}
            <div className="space-y-6">
              {/* ATM Cash-Out Cap Controls */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    Hotspot ATM Withdrawal Cap Control
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Dynamically adjust max cash-out limit per transaction in high-risk zones.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">Connaught Place & Janakpuri Cluster</span>
                      <span className="text-[10px] text-slate-500">9 Predicted High-Risk ATM Terminals</span>
                    </div>
                    <button
                      onClick={() => setIsCpAtmRestricted(!isCpAtmRestricted)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        isCpAtmRestricted ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isCpAtmRestricted ? 'RESTRICTION ACTIVE' : 'NORMAL LIMIT'}
                    </button>
                  </div>

                  {isCpAtmRestricted && (
                    <div className="space-y-2 bg-blue-50/60 border border-blue-200 p-3.5 rounded-xl">
                      <div className="flex justify-between font-bold text-blue-900">
                        <span>Max Single Txn Limit:</span>
                        <span className="font-mono text-sm">₹ {cpAtmCap.toLocaleString('en-IN')}</span>
                      </div>

                      <input 
                        type="range" 
                        min={2000}
                        max={25000}
                        step={1000}
                        value={cpAtmCap}
                        onChange={(e) => setCpAtmCap(Number(e.target.value))}
                        className="w-full accent-blue-700 cursor-pointer"
                      />

                      <div className="flex justify-between text-[10px] text-blue-700 font-mono">
                        <span>₹ 2,000 (Strict)</span>
                        <span>₹ 25,000 (Standard)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FIU-IND & Regulatory Compliance Info Box */}
              <div className="bg-indigo-50/70 border border-indigo-200 text-slate-900 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm flex items-center gap-2 text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  FIU-IND Regulatory Integration
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Lien placement triggers are timestamped and signed with PKI digital signatures for statutory compliance under PMLA 2002 & Cyber Fraud Control circulars.
                </p>

                <div className="pt-2 border-t border-indigo-200 text-[10px] font-mono text-slate-500 space-y-1">
                  <div>API Security: TLS 1.3 mTLS Certificate</div>
                  <div>Audit Node: Bank Nodal Node #4409</div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
