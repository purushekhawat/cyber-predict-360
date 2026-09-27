'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ShieldAlert, 
  Siren, 
  MapPin, 
  Clock, 
  Navigation, 
  Radio, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  Camera, 
  Search, 
  Car, 
  ShieldCheck,
  Send,
  Zap,
  Lock,
  Download,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Filter
} from 'lucide-react';

const HotspotMap = dynamic(() => import('@/components/HotspotMap'), { ssr: false });

interface PatrolUnit {
  id: string;
  callSign: string;
  officerInCharge: string;
  zone: string;
  status: 'PATROLLING' | 'DISPATCHED' | 'INTERCEPTING' | 'AVAILABLE';
  etaMinutes: number;
  currentLocation: string;
  targetAtm?: string;
  driverName: string;
  fuelPct: number;
}

interface DispatchAlert {
  id: string;
  ackId: string;
  crimeCategory: string;
  targetAtm: string;
  bankName: string;
  address: string;
  predictedTimeWindow: string;
  riskScore: number;
  status: 'PENDING_DISPATCH' | 'UNIT_ENROUTE' | 'INTERCEPTED' | 'RESOLVED';
  assignedUnit?: string;
  lossAmount: number;
}

const INITIAL_PATROL_UNITS: PatrolUnit[] = [
  { id: 'PCR-101', callSign: 'CYBER-ALPHA 1', officerInCharge: 'Insp. R. S. Sharma', driverName: 'HC Mohan Lal', fuelPct: 88, zone: 'Connaught Place - Central', status: 'DISPATCHED', etaMinutes: 3.5, currentLocation: 'Barakhamba Road', targetAtm: 'PNB CP Block C (ATM_0098)' },
  { id: 'PCR-104', callSign: 'CYBER-BRAVO 2', officerInCharge: 'Sub-Insp. Vikram Singh', driverName: 'Constable Rajesh', fuelPct: 74, zone: 'Nehru Place - South', status: 'PATROLLING', etaMinutes: 6.0, currentLocation: 'Outer Ring Road' },
  { id: 'PCR-108', callSign: 'CYBER-CHARLIE 4', officerInCharge: 'Insp. Ananya Verma', driverName: 'HC Praveen Kumar', fuelPct: 92, zone: 'Janakpuri - West', status: 'INTERCEPTING', etaMinutes: 1.2, currentLocation: 'District Centre', targetAtm: 'SBI Janakpuri (ATM_0042)' },
  { id: 'PCR-112', callSign: 'CYBER-DELTA 9', officerInCharge: 'Sub-Insp. Manoj Kumar', driverName: 'Constable Sunil', fuelPct: 65, zone: 'Noida Sec-18 Hub', status: 'AVAILABLE', etaMinutes: 8.5, currentLocation: 'Atta Market Sector 18' },
  { id: 'PCR-115', callSign: 'CYBER-ECHO 5', officerInCharge: 'Sub-Insp. Rakesh Rathi', driverName: 'HC Amit Tyagi', fuelPct: 80, zone: 'Jamtara Sector 2', status: 'PATROLLING', etaMinutes: 4.0, currentLocation: 'Main Chowk Jamtara' },
  { id: 'PCR-118', callSign: 'CYBER-FOXTROT 7', officerInCharge: 'Insp. Gurpreet Singh', driverName: 'Constable Harpreet', fuelPct: 95, zone: 'Mewat Border Patrol', status: 'AVAILABLE', etaMinutes: 9.0, currentLocation: 'Nuh Highway' },
];

const INITIAL_DISPATCH_ALERTS: DispatchAlert[] = [
  { id: 'ALT-9901', ackId: 'ACK20260900001', crimeCategory: 'UPI FRAUD', targetAtm: 'ATM_0098', bankName: 'Punjab National Bank', address: 'Connaught Place, Block C, New Delhi', predictedTimeWindow: 'Within next 12 - 45 mins', riskScore: 0.88, status: 'UNIT_ENROUTE', assignedUnit: 'CYBER-ALPHA 1', lossAmount: 75000 },
  { id: 'ALT-9904', ackId: 'ACK20260900003', crimeCategory: 'INVESTMENT SCAM', targetAtm: 'ATM_0042', bankName: 'State Bank of India', address: 'Janakpuri District Centre, New Delhi', predictedTimeWindow: 'Within next 5 - 20 mins', riskScore: 0.94, status: 'PENDING_DISPATCH', lossAmount: 150000 },
  { id: 'ALT-9908', ackId: 'ACK20260900007', crimeCategory: 'CREDIT CARD CLONING', targetAtm: 'ATM_0112', bankName: 'HDFC Bank', address: 'Noida Sec 18 Metro Gate 1', predictedTimeWindow: 'Within next 30 - 90 mins', riskScore: 0.76, status: 'PENDING_DISPATCH', lossAmount: 45000 },
];

const MOCK_EVIDENCE_LOGS = [
  { id: 'EVD-1092', ackId: 'ACK20260900001', atmId: 'ATM_0098', cctvStatus: 'SECURED (Hash #c8f921)', skimmerFound: true, vehicleReg: 'DL 01 AB 9988', officer: 'Insp. R. S. Sharma', timestamp: '2026-09-27 11:45 IST' },
  { id: 'EVD-1093', ackId: 'ACK20260900002', atmId: 'ATM_0042', cctvStatus: 'REQUESTED', skimmerFound: false, vehicleReg: 'HR 26 CB 4411', officer: 'Insp. Ananya Verma', timestamp: '2026-09-27 10:20 IST' },
  { id: 'EVD-1094', ackId: 'ACK20260900003', atmId: 'ATM_0112', cctvStatus: 'SECURED (Hash #a4e109)', skimmerFound: true, vehicleReg: 'UP 16 XY 7722', officer: 'Sub-Insp. Manoj Kumar', timestamp: '2026-09-27 09:15 IST' },
];

export default function PoliceDashboardView() {
  const pathname = usePathname();
  const [patrolUnits, setPatrolUnits] = useState<PatrolUnit[]>(INITIAL_PATROL_UNITS);
  const [alerts, setAlerts] = useState<DispatchAlert[]>(INITIAL_DISPATCH_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<DispatchAlert>(INITIAL_DISPATCH_ALERTS[0]);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Field Form State
  const [cctvCaptured, setCctvCaptured] = useState(true);
  const [skimmerFound, setSkimmerFound] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [notes, setNotes] = useState('');
  const [logSubmitted, setLogSubmitted] = useState(false);

  // Filter state for units
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('ALL');

  const handleDispatch = (alertId: string, unitCallSign: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'UNIT_ENROUTE', assignedUnit: unitCallSign } : a));
    setPatrolUnits(prev => prev.map(u => u.callSign === unitCallSign ? { ...u, status: 'DISPATCHED', targetAtm: selectedAlert.targetAtm } : u));
    setDispatchSuccessMsg(`Emergency alert ${alertId} dispatched to ${unitCallSign}! ETA: 3.5 mins.`);
    setTimeout(() => setDispatchSuccessMsg(null), 4000);
  };

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLogSubmitted(true);
    setTimeout(() => setLogSubmitted(false), 3500);
  };

  const filteredUnits = patrolUnits.filter(u => unitStatusFilter === 'ALL' || u.status === unitStatusFilter);

  // Route-based view selector
  const isUnitsPage = pathname === '/police/units';
  const isEvidencePage = pathname === '/police/evidence';
  const isHotlinesPage = pathname === '/police/hotlines';
  const isMapPage = pathname === '/police/map';

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-red-200">
              <Siren className="w-3.5 h-3.5 text-red-600 animate-pulse" /> CYBER-PREDICT 360 • POLICE PATROL PORTAL
            </span>
            <span className="text-[11px] font-mono text-slate-400 font-bold">PS ID 26184 • I4C MHA</span>
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            {isUnitsPage ? 'Patrol Vans & Mobile Fleet Roster' :
             isEvidencePage ? 'Field Evidence Audit Log & CCTV Vault' :
             isHotlinesPage ? 'Emergency Bank Nodal Hotlines' :
             isMapPage ? 'Spatial Hotspot Map Radar' :
             'Police Field Patrol Interception Dashboard'}
          </h1>
          <p className="text-slate-500 text-xs font-medium">
            Predictive ATM Cash-Out Interception, PCR Mobile Dispatching & On-Ground Incident Reporting.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => handleDispatch(alerts[1]?.id, 'CYBER-DELTA 9')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Siren className="w-4 h-4" />
            <span>INSTANT PCR DISPATCH</span>
          </button>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* SUB-VIEW MAP: /police/map (SPATIAL HOTSPOT MAP RADAR) */}
      {isMapPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Spatial Hotspot Map Radar • Police Operations
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time Leaflet 3D ATM skimming clusters, active victim nodes, and PCR unit patrol radii.</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[600px]">
              <HotspotMap />
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: /police/units (PATROL VANS FLEET ROSTER) */}
      {isUnitsPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  Active Cyber PCR Mobile Patrol Fleet Roster
                </h3>
                <p className="text-xs text-slate-500 font-medium">Real-time GPS vehicle tracking, officer assignments, and zone readiness.</p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 text-xs font-mono font-bold">
                {['ALL', 'PATROLLING', 'DISPATCHED', 'INTERCEPTING', 'AVAILABLE'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setUnitStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      unitStatusFilter === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-400 transition-all bg-slate-50/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-sm font-black text-slate-900 block">{unit.callSign}</span>
                      <span className="text-xs font-bold text-blue-900">{unit.officerInCharge}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      unit.status === 'DISPATCHED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      unit.status === 'INTERCEPTING' ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse' :
                      unit.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {unit.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100 font-medium">
                    <div>Driver: <strong className="text-slate-800">{unit.driverName}</strong></div>
                    <div>Assigned Zone: <strong className="text-slate-800">{unit.zone}</strong></div>
                    <div>Location: {unit.currentLocation}</div>
                    <div className="flex justify-between text-[11px] font-mono pt-1">
                      <span>Fuel Level: <strong className="text-emerald-700">{unit.fuelPct}%</strong></span>
                      <span>ETA Radius: <strong className="text-blue-700">{unit.etaMinutes} mins</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispatch(alerts[0].id, unit.callSign)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Re-Assign / Dispatch Unit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: /police/evidence (FIELD EVIDENCE LOGS) */}
      {isEvidencePage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  Field Interception Evidence Vault & CCTV Log
                </h3>
                <p className="text-xs text-slate-500 font-medium">Auditable record of secured ATM CCTV footage, hardware skimmers, and suspect vehicle numbers.</p>
              </div>

              <button 
                onClick={() => setDispatchSuccessMsg("Evidence audit log exported to PDF.")}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Evidence ID</th>
                    <th className="p-3">NCRP ACK ID / ATM</th>
                    <th className="p-3">CCTV Footage Status</th>
                    <th className="p-3">Skimmer Detected</th>
                    <th className="p-3">Vehicle Reg. No.</th>
                    <th className="p-3">Reporting Officer</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {MOCK_EVIDENCE_LOGS.map((evd) => (
                    <tr key={evd.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{evd.id}</td>
                      <td className="p-3 text-blue-900 font-bold">{evd.ackId} ({evd.atmId})</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {evd.cctvStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evd.skimmerFound ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {evd.skimmerFound ? 'YES - SKIMMER RECOVERED' : 'NONE'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{evd.vehicleReg}</td>
                      <td className="p-3 text-slate-700 font-sans">{evd.officer}</td>
                      <td className="p-3 text-slate-500">{evd.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: /police/hotlines (EMERGENCY BANK HOTLINES) */}
      {isHotlinesPage && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-600" />
                Emergency Bank Nodal Officer Direct Contact Directory
              </h3>
              <p className="text-xs text-slate-500 font-medium">Direct emergency 24x7 desk contacts for instant ATM cash-out freeze & card blockades.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { bank: 'Punjab National Bank (PNB)', contact: '+91 11 2371 9000', email: 'nodal.cyber@pnb.co.in', officer: 'Rajesh Tyagi (GM Fraud Desk)', responseSla: '< 5 Mins' },
                { bank: 'State Bank of India (SBI)', contact: '+91 22 2282 0404', email: 'cybercell@sbi.co.in', officer: 'Sunil Mehta (Nodal Head)', responseSla: '< 3 Mins' },
                { bank: 'HDFC Bank', contact: '+91 22 6160 6161', email: 'fraudcontrol@hdfcbank.com', officer: 'Ananya Roy (Fraud Desk)', responseSla: '< 4 Mins' },
                { bank: 'ICICI Bank', contact: '+91 22 2653 1414', email: 'nodal.fraud@icicibank.com', officer: 'Vikas Sharma (Risk Ops)', responseSla: '< 5 Mins' },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5 bg-amber-50/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-sm text-slate-900">{item.bank}</h4>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      SLA {item.responseSla}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-mono text-slate-700">
                    <div>Nodal Officer: <strong className="font-sans text-slate-900">{item.officer}</strong></div>
                    <div>Hotline Direct: <strong className="text-red-700">{item.contact}</strong></div>
                    <div className="text-slate-500 text-[11px] truncate">Secure Email: {item.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setDispatchSuccessMsg(`Hotline triggered to ${item.bank}! Nodal officer notified.`);
                    }}
                    className="w-full py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Trigger Emergency Interception Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT SUB-VIEW: /police (LIVE DISPATCH QUEUE & PATROL RADAR) */}
      {!isUnitsPage && !isEvidencePage && !isHotlinesPage && (
        <>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Active PCR Vans</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">4 / 8</span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> ONLINE
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Deployed across active NCR hot zones</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Avg Interception ETA</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-700 font-mono">4.2 Mins</span>
                <span className="text-[11px] font-bold text-blue-600">HIGH RESPONSE</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Optimal 2km spatial radius dispatch</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">High Risk ATM Alerts</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-red-600">3 PENDING</span>
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">URGENT</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Predicted withdrawal windows active</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Prevented Cash Loss</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700 font-mono">₹ 14.8 Lakhs</span>
                <span className="text-[11px] font-bold text-emerald-600">THIS WEEK</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">18 Successful ATM Interceptions</div>
            </div>
          </div>

          {/* Main Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Live Dispatch Queue & Patrol Tracker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active ATM Dispatch Queue */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Live Predicted ATM Withdrawal Interception Queue
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-slate-500">{alerts.length} Active Targets</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {alerts.map((alert) => {
                    const isSelected = selectedAlert.id === alert.id;
                    return (
                      <div 
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`p-4 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                          isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-blue-900">{alert.ackId}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 font-mono">
                              {alert.crimeCategory}
                            </span>
                            <span className="text-xs font-bold text-slate-700">₹ {alert.lossAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            {alert.bankName} - {alert.targetAtm}
                          </h4>
                          <p className="text-xs text-slate-500">{alert.address}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1 font-medium">
                            <span className="flex items-center gap-1 text-amber-700 font-bold">
                              <Clock className="w-3 h-3" /> {alert.predictedTimeWindow}
                            </span>
                            <span>• Risk Index: <strong className="text-red-600">{(alert.riskScore * 100).toFixed(0)}%</strong></span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto justify-between">
                          {alert.status === 'UNIT_ENROUTE' ? (
                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Car className="w-3 h-3" /> {alert.assignedUnit} ENROUTE
                              </span>
                              <span className="text-[10px] font-mono text-emerald-700 block mt-1 font-bold">ETA: 3.5 mins</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDispatch(alert.id, 'CYBER-ALPHA 1');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Dispatch PCR</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Patrol Units Radar List */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  Cyber PCR Patrol Vans & Field Units Status
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {patrolUnits.slice(0, 4).map((unit) => (
                    <div key={unit.id} className="border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 transition-all space-y-2 bg-slate-50/40">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-xs font-extrabold text-slate-900 block">{unit.callSign}</span>
                          <span className="text-[11px] font-medium text-slate-500">{unit.officerInCharge}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          unit.status === 'DISPATCHED' ? 'bg-amber-100 text-amber-800' :
                          unit.status === 'INTERCEPTING' ? 'bg-red-100 text-red-800 animate-pulse' :
                          unit.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {unit.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5 font-medium pt-1 border-t border-slate-100">
                        <div>Zone: <strong className="text-slate-800">{unit.zone}</strong></div>
                        <div>Location: {unit.currentLocation}</div>
                        {unit.targetAtm && (
                          <div className="text-red-600 font-bold text-[11px] truncate">Target: {unit.targetAtm}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Field Officer Incident Log & Emergency Actions */}
            <div className="space-y-6">
              {/* Incident Log Form */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    Field Evidence & Interception Report
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Log field findings directly into auditable record.</p>
                </div>

                {logSubmitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-xs text-emerald-900">Report Successfully Synchronized</h4>
                    <p className="text-[11px] text-emerald-700 font-medium">Audit hash generated & sent to NCRP Central Command.</p>
                  </div>
                ) : (
                  <form onSubmit={handleFieldSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Target ATM ACK ID</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedAlert.ackId} 
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={cctvCaptured} 
                          onChange={(e) => setCctvCaptured(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-700">ATM CCTV Footage Requested / Secured</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={skimmerFound} 
                          onChange={(e) => setSkimmerFound(e.target.checked)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-medium text-slate-700 text-red-600 font-bold">ATM Hardware Skimmer / Overlay Detected</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Suspect Vehicle / Scooter Reg. No.</label>
                      <input 
                        type="text" 
                        placeholder="e.g. DL 01 AB 9988"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Field Patrol Remarks</label>
                      <textarea 
                        rows={3}
                        placeholder="Enter on-ground observation details..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Field Evidence Log</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Bank Nodal Hotline & Emergency Triggers */}
              <div className="bg-amber-50/70 border border-amber-200 text-slate-900 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-2 text-amber-900">
                  <PhoneCall className="w-4 h-4 text-amber-700" />
                  Emergency Bank Nodal Hotlines
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Direct emergency escalation lines to trigger instant card blockades & cash dispenser hold.
                </p>

                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                    <span>PNB Fraud Nodal:</span>
                    <strong className="font-bold text-amber-900">+91 11 2371 9000</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                    <span>SBI Cyber Cell Desk:</span>
                    <strong className="font-bold text-amber-900">+91 22 2282 0404</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-amber-200 text-slate-800">
                    <span>HDFC Fraud Control:</span>
                    <strong className="font-bold text-amber-900">+91 22 6160 6161</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
