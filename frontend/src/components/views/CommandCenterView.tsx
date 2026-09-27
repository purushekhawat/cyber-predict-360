'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { fetchSyntheticStats, fetchComplaints, generatePredictionForecast } from '@/lib/api';
import { Shield, Sparkles, Activity, FileText, MapPin, AlertCircle, ArrowUpRight, CheckCircle2, Zap, Send, Building, Siren, Building2, ArrowRight, Globe } from 'lucide-react';

const HotspotMap = dynamic(() => import('@/components/HotspotMap'), { ssr: false });

interface CommandCenterViewProps {
  onNavigateToPrediction: (ackId: string) => void;
  onNavigateToHeatmap: () => void;
}

export default function CommandCenterView({ onNavigateToPrediction, onNavigateToHeatmap }: CommandCenterViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertFilter, setAlertFilter] = useState<string>('ALL');
  const [dispatchedAlerts, setDispatchedAlerts] = useState<Record<string, string>>({});
  const [mapViewMode, setMapViewMode] = useState<'map' | 'table'>('map');

  const mockComplaints = [
    { id: '1', complaint_number: 'NCRP-2026-99001', category: 'FINANCIAL_FRAUD', victim_name: 'Ramesh Chander', amount_loss: 150000, status: 'INVESTIGATING', reported_at: '2026-09-01T10:00:00Z', victim_latitude: 28.6139, victim_longitude: 77.2090 },
    { id: '2', complaint_number: 'NCRP-2026-99002', category: 'PHISHING', victim_name: 'Sunita Devi', amount_loss: 450000, status: 'REPORTED', reported_at: '2026-09-01T09:30:00Z', victim_latitude: 23.9627, victim_longitude: 86.8021 },
    { id: '3', complaint_number: 'NCRP-2026-99003', category: 'ATM_SKIMMING', victim_name: 'Karan Malhotra', amount_loss: 85000, status: 'UNDER_REVIEW', reported_at: '2026-09-01T08:15:00Z', victim_latitude: 28.1026, victim_longitude: 77.0016 },
    { id: '4', complaint_number: 'NCRP-2026-99004', category: 'UPI_FRAUD', victim_name: 'Anish Verma', amount_loss: 220000, status: 'INVESTIGATING', reported_at: '2026-09-01T07:45:00Z', victim_latitude: 19.0760, victim_longitude: 72.8777 },
    { id: '5', complaint_number: 'NCRP-2026-99005', category: 'SEXTORTION', victim_name: 'Priya Sharma', amount_loss: 95000, status: 'REPORTED', reported_at: '2026-09-01T06:20:00Z', victim_latitude: 12.9716, victim_longitude: 77.5946 },
  ];

  const mockLocations = [
    { id: '1', name: 'Jamtara Cyber Crime Hub', city: 'Jamtara', state: 'Jharkhand', pincode: '815351', latitude: 23.9627, longitude: 86.8021, risk_level: 'CRITICAL', complaints: 118 },
    { id: '2', name: 'Mewat APK Fraud Zone', city: 'Nuh', state: 'Haryana', pincode: '122107', latitude: 28.1026, longitude: 77.0016, risk_level: 'CRITICAL', complaints: 94 },
    { id: '3', name: 'Delhi NCR ATM Cluster', city: 'New Delhi', state: 'Delhi NCR', pincode: '110001', latitude: 28.6139, longitude: 77.2090, risk_level: 'CRITICAL', complaints: 142 },
    { id: '4', name: 'Cyberabad IT Cell', city: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4435, longitude: 78.3772, risk_level: 'HIGH', complaints: 78 },
    { id: '5', name: 'Mumbai Metro Cash-Out', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', latitude: 19.0760, longitude: 72.8777, risk_level: 'HIGH', complaints: 86 },
  ];

  const mockAlerts = [
    { id: 'ALT_001', title: 'High-Velocity Mule Layering in SBI Acc #30981234567', severity: 'CRITICAL', category: 'MULE_ACCOUNT', description: 'Over ₹15,000,000 funneled through 12 rapid UPI transfers within 18 minutes.', status: 'NEW', ackId: 'ACK20260900001', timeWindow: '1.18 hrs' },
    { id: 'ALT_002', title: 'Geographic Anomaly: ATM Skimming Burst in Jamtara', severity: 'CRITICAL', category: 'ATM_SKIMMING', description: 'Multiple skimming reports linked to ATM-JMT-01 with high cash withdrawal density.', status: 'UNDER_INVESTIGATION', ackId: 'ACK20260900002', timeWindow: '0.85 hrs' },
    { id: 'ALT_003', title: 'APK Malware Distribution Network Active in Mewat', severity: 'HIGH', category: 'PHISHING', description: 'SMShing campaign spreading malicious APK file targeting OTP bypass.', status: 'NEW', ackId: 'ACK20260900003', timeWindow: '2.10 hrs' },
    { id: 'ALT_004', title: 'Sequential Cash-Out Cluster Detected at PNB Connaught Place', severity: 'HIGH', category: 'ATM_CASH_OUT', description: 'Predicted withdrawal likelihood 92.4% within next 45 minutes.', status: 'NEW', ackId: 'ACK20260900004', timeWindow: '0.45 hrs' },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sRes, cRes] = await Promise.all([
          fetchSyntheticStats().catch(() => null),
          fetchComplaints(undefined, 10).catch(() => []),
        ]);
        if (sRes) setStats(sRes);
        if (cRes && cRes.length > 0) setRecentComplaints(cRes);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDispatch = (alertId: string, actionText: string) => {
    setDispatchedAlerts(prev => ({ ...prev, [alertId]: actionText }));
  };

  const filteredAlerts = mockAlerts.filter(a => alertFilter === 'ALL' || a.severity === alertFilter);

  return (
    <div className="space-y-6">
      {/* CYBER-PREDICT 360 Specialized Portals Try/Explore Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#9a7547] text-[10px] font-black uppercase tracking-wider border border-amber-200">
                I4C • MHA • PS ID 26184
              </span>
              <span className="text-[11px] font-extrabold text-slate-400">STANDALONE WORKFLOW PORTALS</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9a7547] inline-block animate-pulse"></span>
              CYBER-PREDICT 360 Role Portals
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
            Multi-Agency Law Enforcement & Banking Portals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Police Dashboard Try Card */}
          <Link 
            href="/police" 
            className="group bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-red-400 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Siren className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wide">
                    Law Enforcement
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-red-700 transition-colors mt-0.5">
                    Police Field Patrol Dashboard
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold font-mono border border-red-200">
                12 VANS ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium relative z-10 leading-relaxed">
              PCR Mobile Dispatching, 2km Proximity Interception, CCTV Evidence Vault & Bank Hotlines.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 relative z-10">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 font-bold">
                <span>• PCR Dispatch</span>
                <span>• CCTV Vault</span>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all group-hover:translate-x-1">
                <span>Launch Police Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Bank Dashboard Try Card */}
          <Link 
            href="/bank" 
            className="group bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide">
                    Financial Institution
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors mt-0.5">
                    Bank Nodal Control Dashboard
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold font-mono border border-indigo-200">
                ₹4.52Cr FROZEN
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium relative z-10 leading-relaxed">
              Mule Account Lien Freezing, ATM Cash-Out Cap Throttle & RBI FIU SAR Reporting.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 relative z-10">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 font-bold">
                <span>• Account Liens</span>
                <span>• Cash-Out Caps</span>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all group-hover:translate-x-1">
                <span>Launch Bank Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
      {/* 4 AI Stat Cards Row (Research Portal AI Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Complaints */}
        <div className="glass-card ai-card-bg p-6 space-y-3 relative overflow-hidden group">
          <div className="topo-lines"></div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#9a7547]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Total NCRP Complaints</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#9a7547] border border-amber-200/60 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-[#9a7547] font-mono tracking-tight">
              {stats?.counts?.total_complaints ? stats.counts.total_complaints.toLocaleString() : '1,428'}
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#9a7547] inline" /> Verified Ingestion
            </p>
          </div>
        </div>

        {/* Card 2: Flagged Loss */}
        <div className="glass-card ai-card-bg p-6 space-y-3 relative overflow-hidden group">
          <div className="topo-lines"></div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Flagged Loss Amount</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">
              ₹4,52,00,000
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 inline" /> High-Risk Mule Layering
            </p>
          </div>
        </div>

        {/* Card 3: Active Threat Alerts */}
        <div className="glass-card ai-card-bg p-6 space-y-3 relative overflow-hidden group">
          <div className="topo-lines"></div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Active Threat Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-amber-600 font-mono tracking-tight">14</div>
            <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 inline" /> Interception Priority
            </p>
          </div>
        </div>

        {/* Card 4: Spatial Accuracy */}
        <div className="glass-card ai-card-bg p-6 space-y-3 relative overflow-hidden group">
          <div className="topo-lines"></div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">PostGIS Spatial Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">262.9m</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> Mean Proximity Radius
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Complaints & Spatial Hotspots) */}
        <div className="lg:col-span-7 space-y-6">
          {/* NCRP Reported Cybercrime Complaints Table */}
          <div className="glass-card ai-card-bg p-6 space-y-4">
            <div className="topo-lines"></div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 relative z-10">
              <h3 className="text-base font-bold text-[#9a7547] flex items-center gap-2">
                NCRP Reported Cybercrime Complaints
              </h3>
              <span className="text-xs text-gray-400 font-mono">Live Ingestion Queue</span>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th>Complaint #</th>
                    <th>Category</th>
                    <th>Victim Name</th>
                    <th>Loss Amount</th>
                    <th>Coordinates (PostGIS)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {(recentComplaints.length > 0 ? recentComplaints : mockComplaints).map((c: any) => (
                    <tr key={c.complaint_ack_id || c.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="font-bold text-[#9a7547]">{c.complaint_ack_id || c.complaint_number}</td>
                      <td>
                        <span className="badge badge-medium">
                          {c.crime_category || c.category}
                        </span>
                      </td>
                      <td className="text-gray-900 font-sans font-medium">{c.victim_name || 'NCRP Victim'}</td>
                      <td className="text-amber-700 font-bold">
                        ₹{(c.loss_amount || c.amount_loss || 75000).toLocaleString('en-IN')}
                      </td>
                      <td className="text-gray-500 text-[11px]">
                        {(c.latitude || c.victim_latitude || 28.6139).toFixed(4)}, {(c.longitude || c.victim_longitude || 77.2090).toFixed(4)}
                      </td>
                      <td>
                        <span className={`badge badge-${(c.status || 'INVESTIGATING') === 'INVESTIGATING' ? 'critical' : 'medium'}`}>
                          {c.status || 'INVESTIGATING'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigateToPrediction(c.complaint_ack_id || 'ACK20260900001')}
                          className="px-3 py-1 bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold text-[10px] rounded-lg transition-all shadow-xs"
                        >
                          Forecast
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PostGIS Spatial Cyber Crime Hot-Spots Card */}
          <div className="glass-card ai-card-bg p-6 space-y-4">
            <div className="topo-lines"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 relative z-10">
              <h3 className="text-base font-bold text-[#9a7547] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9a7547]" />
                <span>PostGIS Spatial Cyber Crime Hot-Spots</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold font-mono border border-gray-200">
                  <button
                    onClick={() => setMapViewMode('map')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mapViewMode === 'map' ? 'bg-[#9a7547] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🗺️ Live Heatmap
                  </button>
                  <button
                    onClick={() => setMapViewMode('table')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mapViewMode === 'table' ? 'bg-[#9a7547] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📋 Data Table
                  </button>
                </div>

                <Link
                  href="/map"
                  className="px-3.5 py-1.5 bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D Map</span>
                </Link>
              </div>
            </div>

            {mapViewMode === 'map' ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 relative z-10 min-h-[500px]">
                <HotspotMap />
              </div>
            ) : (
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th>Location Name</th>
                      <th>City / State</th>
                      <th>PostGIS Geo Coordinates</th>
                      <th>Active Complaints</th>
                      <th>Threat Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {mockLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="font-bold text-gray-900 font-sans">{loc.name}</td>
                        <td className="text-gray-500 font-sans">{loc.city}, {loc.state}</td>
                        <td className="text-blue-700 text-[11px]">
                          ST_Point({loc.longitude}, {loc.latitude})
                        </td>
                        <td className="text-rose-600 font-bold">{loc.complaints} Incidents</td>
                        <td>
                          <span className={`badge badge-${loc.risk_level.toLowerCase()}`}>
                            {loc.risk_level}
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

        {/* Right Column (Enhanced Intelligence Alerts Feed & Stack Status) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enhanced Intelligence Alerts Feed Card */}
          <div className="glass-card ai-card-bg p-6 space-y-5">
            <div className="topo-lines"></div>

            {/* Alert Feed Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#9a7547] flex items-center gap-1.5">
                  Intelligence Alerts Feed
                </h3>
              </div>

              {/* Severity Filter Pills */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAlertFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      alertFilter === sev
                        ? 'bg-[#9a7547] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert List Container */}
            <div className="space-y-3.5 relative z-10">
              {filteredAlerts.map((al) => {
                const actionTaken = dispatchedAlerts[al.id];
                return (
                  <div
                    key={al.id}
                    className="p-4 rounded-xl bg-white border border-gray-200/80 hover:border-[#9a7547]/40 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${al.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                          {al.severity}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-blue-700">{al.ackId}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                        ETA: {al.timeWindow}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-gray-900 leading-snug">{al.title}</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-1">{al.description}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100/80">
                      <span className="text-[10px] font-mono text-gray-500">
                        CAT: <strong className="text-[#9a7547]">{al.category}</strong>
                      </span>

                      {/* Interactive Dispatch Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {actionTaken ? (
                          <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {actionTaken}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDispatch(al.id, 'FIELD DISPATCHED')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all shadow-xs flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Dispatch
                            </button>
                            <button
                              onClick={() => handleDispatch(al.id, 'BANK NOTIFIED')}
                              className="px-2.5 py-1 bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold text-[10px] rounded-lg transition-all shadow-xs flex items-center gap-1"
                            >
                              <Building className="w-3 h-3" /> Notify Bank
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

          {/* Architecture Stack Status Card */}
          <div className="glass-card ai-card-bg p-6 space-y-4">
            <div className="topo-lines"></div>
            <h3 className="text-base font-bold text-[#9a7547] flex items-center gap-2 border-b border-gray-100 pb-3 relative z-10">
              Architecture Stack Status
            </h3>
            <div className="space-y-2.5 text-xs font-mono relative z-10">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Backend REST API:</span>
                <span className="text-[#9a7547] font-bold">Python 3.11 + FastAPI</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">ML Spatial Engine:</span>
                <span className="text-emerald-700 font-bold">Scikit-Learn + DBSCAN</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Spatial Database:</span>
                <span className="text-blue-700 font-bold">PostgreSQL 16 + PostGIS</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Frontend Framework:</span>
                <span className="text-purple-700 font-bold">Next.js 14 + TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
