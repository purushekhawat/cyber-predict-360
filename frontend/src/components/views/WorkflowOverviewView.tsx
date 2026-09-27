'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Cpu, 
  MapPin, 
  Bell, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Server, 
  Download, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Network, 
  FileText, 
  Sun, 
  Moon, 
  Activity,
  UserCheck,
  Lock,
  Radio,
  Sparkles
} from 'lucide-react';

interface StepDetail {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  inputs: string[];
  outputs: string[];
  techStack: string[];
  samplePayload: object;
}

export default function WorkflowOverviewView() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [themeMode, setThemeMode] = useState<'dark' | 'ppt'>('ppt'); // Default PPT mode
  const [viewTab, setViewTab] = useState<'diagram' | 'flow' | 'arch' | 'data'>('diagram');
  const [selectedNode, setSelectedNode] = useState<string | null>('FastAPI Core & Orchestrator');

  const steps: StepDetail[] = [
    {
      id: 1,
      title: "1. Incident Ingestion",
      subtitle: "NCRP Complaint Capture & Preprocessing",
      badge: "DATA INPUT",
      icon: FileText,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50/80 dark:bg-blue-950/40",
      borderColor: "border-blue-300 dark:border-blue-700",
      textColor: "text-blue-700 dark:text-blue-300",
      description: "Cybercrime complaint lodged on NCRP portal is ingested via secure webhooks/REST API. Extracts transaction timestamps, victim geolocation, victim account, IFSC, and mule bank details.",
      inputs: [
        "Complaint Acknowledgment ID (ACK20260900001)",
        "Victim Geolocation (Lat/Lng) & Time of Fraud",
        "Target Mule Account & Bank IFSC Code",
        "Total Fraudulent Amount (INR)"
      ],
      outputs: [
        "Normalized Cyber Incident Struct",
        "Cleaned Geolocation Spatial Point",
        "Mule Entity Profile Record"
      ],
      techStack: ["FastAPI Backend", "Pydantic v2 Validator", "PostgreSQL Ingestion Queue"],
      samplePayload: {
        acknowledgment_id: "ACK20260900001",
        incident_timestamp: "2026-09-13T10:15:00Z",
        fraud_amount: 150000,
        victim_location: { latitude: 28.6139, longitude: 77.2090 },
        mule_account: "9182309182391",
        ifsc_code: "SBIN0001234"
      }
    },
    {
      id: 2,
      title: "2. Financial Trail Graph",
      subtitle: "Multi-Hop Mule Account Network Tracking",
      badge: "GRAPH ANALYTICS",
      icon: Network,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50/80 dark:bg-purple-950/40",
      borderColor: "border-purple-300 dark:border-purple-700",
      textColor: "text-purple-700 dark:text-purple-300",
      description: "Traces financial layering across primary, secondary, and tertiary mule accounts to locate the final node before cashout (ATM or POS terminal).",
      inputs: [
        "Primary Fraud Account",
        "Inter-bank RTGS/NEFT/IMPS Logs",
        "Layering Hop Threshold (Max 5 Hops)"
      ],
      outputs: [
        "Mule Graph Traversal Tree",
        "Terminal Cash-Out Account ID",
        "ATM Transaction Linkage Probability"
      ],
      techStack: ["NetworkX / Graph Algorithms", "SQLAlchemy 2.0", "PostGIS Spatial Joins"],
      samplePayload: {
        primary_mule: "9182309182391",
        layer_hops: [
          { hop: 1, account: "9182309182391", amount: 150000 },
          { hop: 2, account: "5544332211009", amount: 145000 }
        ],
        target_cashout_mule: "5544332211009",
        high_risk_flag: true
      }
    },
    {
      id: 3,
      title: "3. Spatial-Temporal ML Engine",
      subtitle: "ST-DBSCAN & XGBoost Probabilistic Scoring",
      badge: "AI PREDICTION",
      icon: Cpu,
      color: "from-amber-600 to-orange-600",
      bgColor: "bg-amber-50/80 dark:bg-amber-950/40",
      borderColor: "border-amber-300 dark:border-amber-700",
      textColor: "text-amber-700 dark:text-amber-300",
      description: "Runs Spatio-Temporal Density-Based Clustering (ST-DBSCAN) combined with Random Forest / XGBoost classifiers to predict the exact ATM cash withdrawal hotspot within a 15-minute window.",
      inputs: [
        "Mule Node Geolocation",
        "Historical ATM Cashout Density (PostGIS)",
        "Temporal Time-Delta Features"
      ],
      outputs: [
        "Predicted ATM Coordinates & Name",
        "Cashout Risk Probability Score (0-100%)",
        "Estimated Time to Cash Withdrawal (ETA)"
      ],
      techStack: ["Python 3.11 ML Service", "ST-DBSCAN", "Scikit-Learn", "PostGIS ST_DWithin"],
      samplePayload: {
        predicted_atm: "SBI ATM - Connaught Place Circle",
        latitude: 28.6315,
        longitude: 77.2167,
        cashout_risk_score: 94.8,
        eta_minutes: 12.5,
        confidence_interval: "95%"
      }
    },
    {
      id: 4,
      title: "4. Real-Time Command Center",
      subtitle: "Interactive Geospatial Heatmaps & Alerts",
      badge: "GEOSPATIAL UI",
      icon: MapPin,
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50/80 dark:bg-emerald-950/40",
      borderColor: "border-emerald-300 dark:border-emerald-700",
      textColor: "text-emerald-700 dark:text-emerald-300",
      description: "Visualizes high-risk ATM clusters, live victim incident markers, buffer zones, and actionable heatmaps on an interactive Leaflet/Mapbox 3D interface.",
      inputs: [
        "ML Prediction Objects",
        "Live Police Station GIS Bounds",
        "ATM Proximity Radii (500m Buffer)"
      ],
      outputs: [
        "Dynamic Heatmap Layer",
        "Interactive Incident Map Pins",
        "Counterfactual Simulation Triggers"
      ],
      techStack: ["Next.js 14 App Router", "Tailwind CSS", "Leaflet JS / React-Leaflet"],
      samplePayload: {
        map_view: "Delhi-NCR Command Zone",
        active_hotspots: 18,
        critical_alerts: 4,
        rendered_layers: ["heatmap", "atm_radii", "police_units"]
      }
    },
    {
      id: 5,
      title: "5. LEA Dispatch & Audit Trail",
      subtitle: "Police Alerting & Evidence Chain of Custody",
      badge: "ACTION & AUDIT",
      icon: Shield,
      color: "from-rose-600 to-red-600",
      bgColor: "bg-rose-50/80 dark:bg-rose-950/40",
      borderColor: "border-rose-300 dark:border-rose-700",
      textColor: "text-rose-700 dark:text-rose-300",
      description: "Dispatches automated high-priority alerts to local police patrol units & bank fraud control cells. Logs tamper-proof SHA-256 evidence hashes for courtroom audit readiness.",
      inputs: [
        "High Confidence ATM Risk Score (>85%)",
        "Nearest Cyber Police Station ID",
        "Bank Freeze API Hook"
      ],
      outputs: [
        "SMS/Push Dispatch Notification to LEAs",
        "Automated Account Block Directive",
        "Chain of Custody SHA-256 Audit Log"
      ],
      techStack: ["Twilio / Gateway Alert API", "SHA-256 Hash Digest", "Evidence Audit Ledger"],
      samplePayload: {
        dispatch_status: "DISPATCHED_TO_PATROL_UNIT_4",
        police_jurisdiction: "Connaught Place Cyber Cell",
        account_freeze_status: "REQUESTED",
        evidence_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      }
    }
  ];

  const handlePrintPPT = () => {
    window.print();
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${
      themeMode === 'ppt' 
        ? 'bg-slate-50 text-slate-900' 
        : 'bg-slate-950 text-slate-100'
    } p-4 md:p-8 font-sans print:p-0 print:bg-white print:text-black`}>
      
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300">
              I4C • MHA Problem Statement ID 26184
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Visual Architecture Diagram (PPT Slide Ready)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            CYBER-PREDICT 360: End-to-End System Workflow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Layered System Architecture & Inter-Component Data Flow Diagram
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Theme Switcher for PPT vs Dark Command */}
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-300 dark:border-slate-700">
            <button
              onClick={() => setThemeMode('ppt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                themeMode === 'ppt'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>PPT Light Mode</span>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                themeMode === 'dark'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark Command</span>
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handlePrintPPT}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export for PPT / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Operational KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border transition-all ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Prediction Window</span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">14.2 Mins</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Advance warning before cashout</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Spatial Accuracy</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">89.4%</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">ST-DBSCAN Cluster Precision</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Hotspot Geofence</span>
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">500 Meters</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">ATM Proximity Buffer Radius</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>Pipeline Latency</span>
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">&lt; 120 ms</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">FastAPI + PostGIS Spatial Query</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center print:hidden">
          <div className={`p-1.5 rounded-2xl border flex gap-2 ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setViewTab('diagram')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'diagram'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🎨 1. End-to-End Diagram Flow (Matches Design)
            </button>
            <button
              onClick={() => setViewTab('flow')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'flow'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📊 2. Step-by-Step Cards (5 Hops)
            </button>
            <button
              onClick={() => setViewTab('arch')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'arch'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🏗️ 3. Clean Tiered Architecture
            </button>
            <button
              onClick={() => setViewTab('data')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewTab === 'data'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ⚡ 4. Data Pipeline Table
            </button>
          </div>
        </div>

        {/* TAB 1: VISUAL END-TO-END DIAGRAM FLOW (MATCHES USER IMAGE) */}
        {viewTab === 'diagram' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${
              themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800'
            }`}>
              
              {/* DIAGRAM SVG CONTAINER */}
              <div className="relative overflow-x-auto">
                <svg viewBox="0 0 1100 860" className="w-full h-auto min-w-[950px] font-sans">
                  <defs>
                    {/* Marker for Arrows */}
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                    <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
                    </marker>

                    {/* Drop Shadows */}
                    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.08"/>
                    </filter>
                  </defs>

                  {/* LAYER 1: Core Intelligence & Evidence Layer (Top Container) */}
                  <rect x="50" y="30" width="1000" height="210" rx="16" fill={themeMode === 'ppt' ? "#f8fafc" : "#0f172a"} stroke={themeMode === 'ppt' ? "#e2e8f0" : "#334155"} strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="550" y="55" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold" letterSpacing="1">
                    Core Intelligence & Evidence Layer
                  </text>

                  {/* Node 1: Smart Contracts / Evidence Ledger */}
                  <g transform="translate(260, 80)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('Evidence Audit Ledger')}>
                    <rect x="0" y="0" width="260" height="75" rx="10" fill="#16a34a" stroke="#15803d" strokeWidth="2" />
                    <text x="130" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🔗 Evidence Audit Ledger
                    </text>
                    <text x="130" y="52" textAnchor="middle" fill="#dcfce7" fontSize="10" fontWeight="medium">
                      SHA-256 Tamper-Proof Chain of Custody
                    </text>
                  </g>

                  {/* Node 2: PostGIS Spatial DB */}
                  <g transform="translate(620, 80)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('PostGIS Database')}>
                    <rect x="0" y="0" width="260" height="75" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    <text x="130" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🗄️ PostGIS Spatial Database
                    </text>
                    <text x="130" y="52" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="medium">
                      PostgreSQL 16 • ST_DWithin Indexing
                    </text>
                  </g>

                  {/* LAYER 2: Actors & Operational Entities (Middle Container) */}
                  <rect x="50" y="270" width="1000" height="240" rx="16" fill={themeMode === 'ppt' ? "#f8fafc" : "#0f172a"} stroke={themeMode === 'ppt' ? "#e2e8f0" : "#334155"} strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="550" y="295" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold" letterSpacing="1">
                    Actors & Operational Stakeholders
                  </text>

                  {/* Node 3: Cybercrime Victim / NCRP Portal */}
                  <g transform="translate(90, 340)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('Victim / NCRP')}>
                    <rect x="0" y="0" width="240" height="75" rx="10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
                    <text x="120" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      👤 Victim / NCRP Portal
                    </text>
                    <text x="120" y="52" textAnchor="middle" fill="#dbeafe" fontSize="10" fontWeight="medium">
                      Lodges complaint & transaction ID
                    </text>
                  </g>

                  {/* Node 4: Mule Account Network */}
                  <g transform="translate(420, 395)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('Mule Accounts')}>
                    <rect x="0" y="0" width="240" height="75" rx="10" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
                    <text x="120" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🏦 Mule Account Network
                    </text>
                    <text x="120" y="52" textAnchor="middle" fill="#ffedd5" fontSize="10" fontWeight="medium">
                      Multi-hop bank layering hops
                    </text>
                  </g>

                  {/* Node 5: Law Enforcement & Patrol Units */}
                  <g transform="translate(740, 340)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('Police Dispatch')}>
                    <rect x="0" y="0" width="250" height="75" rx="10" fill="#7c3aed" stroke="#6d28d9" strokeWidth="2" />
                    <text x="125" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🚨 State Cyber Cell & Police
                    </text>
                    <text x="125" y="52" textAnchor="middle" fill="#ede9fe" fontSize="10" fontWeight="medium">
                      Receives live ATM alert & dispatches patrol
                    </text>
                  </g>

                  {/* LAYER 3: Backend Services & ML Engine (Bottom Container) */}
                  <rect x="50" y="540" width="1000" height="260" rx="16" fill={themeMode === 'ppt' ? "#f8fafc" : "#0f172a"} stroke={themeMode === 'ppt' ? "#e2e8f0" : "#334155"} strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x="550" y="565" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="bold" letterSpacing="1">
                    Backend Microservices & Predictive Engine
                  </text>

                  {/* Node 6: FastAPI Core Backend */}
                  <g transform="translate(140, 610)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('FastAPI Core')}>
                    <rect x="0" y="0" width="260" height="75" rx="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                    <text x="130" y="32" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">
                      ⚙️ FastAPI Core & Orchestrator
                    </text>
                    <text x="130" y="52" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="medium">
                      Handles ingest validation & REST endpoints
                    </text>
                  </g>

                  {/* Node 7: ST-DBSCAN ML Engine */}
                  <g transform="translate(450, 610)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('ST-DBSCAN ML Engine')}>
                    <rect x="0" y="0" width="280" height="75" rx="10" fill="#059669" stroke="#047857" strokeWidth="2" />
                    <text x="140" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🧠 ST-DBSCAN & XGBoost Engine
                    </text>
                    <text x="140" y="52" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="medium">
                      Predicts ATM cashout hotspot & 15-min ETA
                    </text>
                  </g>

                  {/* Node 8: Geospatial Map UI */}
                  <g transform="translate(760, 680)" filter="url(#shadow)" className="cursor-pointer" onClick={() => setSelectedNode('Geospatial Command UI')}>
                    <rect x="0" y="0" width="250" height="75" rx="10" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                    <text x="125" y="32" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                      🗺️ Geospatial Command Center UI
                    </text>
                    <text x="125" y="52" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="medium">
                      Next.js 14 + Leaflet 3D Heatmaps & Radii
                    </text>
                  </g>

                  {/* CONNECTING FLOW ARROWS WITH TEXT LABELS */}

                  {/* 1. Victim -> FastAPI Backend */}
                  <path d="M 210 415 C 210 490 270 520 270 610" fill="none" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                  <text x="250" y="520" fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle">1. Submit Incident & Txn</text>

                  {/* 2. FastAPI -> PostGIS DB */}
                  <path d="M 380 610 C 380 320 750 320 750 155" fill="none" stroke="#64748b" strokeWidth="1.8" markerEnd="url(#arrow)" />
                  <text x="590" y="240" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">2. Save Spatial Metadata</text>

                  {/* 3. FastAPI -> Mule Accounts */}
                  <path d="M 330 610 C 330 520 540 520 540 470" fill="none" stroke="#ea580c" strokeWidth="1.8" markerEnd="url(#arrow)" />
                  <text x="440" y="535" fill="#ea580c" fontSize="10" fontWeight="bold" textAnchor="middle">3. Trace Mule Layering</text>

                  {/* 4. Mule Accounts -> ML Engine */}
                  <path d="M 540 470 L 590 610" fill="none" stroke="#059669" strokeWidth="1.8" markerEnd="url(#arrow-green)" />
                  <text x="580" y="540" fill="#059669" fontSize="10" fontWeight="bold" textAnchor="middle">4. Feature Scoring</text>

                  {/* 5. ML Engine -> PostGIS DB */}
                  <path d="M 640 610 C 640 400 750 300 750 155" fill="none" stroke="#64748b" strokeWidth="1.8" markerEnd="url(#arrow)" />
                  <text x="730" y="470" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">5. 500m Proximity Search</text>

                  {/* 6. ML Engine -> Evidence Ledger */}
                  <path d="M 520 610 C 520 380 390 300 390 155" fill="none" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrow-green)" strokeDasharray="5,5" />
                  <text x="440" y="230" fill="#16a34a" fontSize="10" fontWeight="bold" textAnchor="middle">6. Append SHA-256 Hash</text>

                  {/* 7. ML Engine -> Geospatial UI */}
                  <path d="M 730 650 L 760 700" fill="none" stroke="#d97706" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="720" y="690" fill="#d97706" fontSize="10" fontWeight="bold" textAnchor="middle">7. Push Heatmaps</text>

                  {/* 8. Evidence Ledger -> Police Unit */}
                  <path d="M 450 155 C 450 250 850 240 850 340" fill="none" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrow)" />
                  <text x="690" y="195" fill="#7c3aed" fontSize="10" fontWeight="bold" textAnchor="middle">8. Dispatch Police Alert</text>

                  {/* 9. Police Unit -> Geospatial UI */}
                  <path d="M 865 415 L 885 680" fill="none" stroke="#7c3aed" strokeWidth="1.8" markerEnd="url(#arrow)" strokeDasharray="4,4" />
                  <text x="910" y="550" fill="#7c3aed" fontSize="10" fontWeight="bold" textAnchor="middle">Live Map View</text>
                </svg>
              </div>

              {/* Bottom Label matching image */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">CYBER-PREDICT 360 Architecture Diagram</span>
                <span className="text-amber-600 font-extrabold text-sm italic">End-to-End Flow</span>
              </div>
            </div>

            {/* NODE DRILLDOWN CARD */}
            <div className={`p-6 rounded-3xl border ${
              themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
            }`}>
              <h3 className="text-base font-extrabold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Selected Architecture Component: <strong className="text-amber-600">{selectedNode}</strong></span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Click on any colored box in the diagram above to view component details, API interaction methods, data formats, and latency specs.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: 5-STEP PROCESS FLOWCHART */}
        {viewTab === 'flow' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                End-to-End Operational Workflow Chart
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click on any step card below to inspect inputs, outputs, tech stack, and real API payloads.
              </p>
            </div>

            {/* FLOWCHART CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {steps.map((step) => {
                const isSelected = activeStep === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? `ring-4 ring-amber-500/30 ${step.borderColor} ${step.bgColor} shadow-lg scale-[1.02]` 
                        : themeMode === 'ppt'
                          ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${step.bgColor} ${step.textColor} border ${step.borderColor}`}>
                          {step.badge}
                        </span>
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          {step.id}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-sm leading-tight mb-1">
                        {step.title.replace(/^\d+\.\s*/, '')}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {step.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-[10px] font-bold">
                      <span className={isSelected ? step.textColor : 'text-slate-400'}>
                        {isSelected ? 'Selected' : 'View Details'}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? step.textColor : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FLOW DIRECTION ARROW BANNER */}
            <div className={`p-3 rounded-xl border text-center flex items-center justify-between text-xs font-bold ${
              themeMode === 'ppt' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}>
              <span>📥 1. Complaint Lodged</span>
              <span>➔</span>
              <span>🔗 2. Money Graph Hops</span>
              <span>➔</span>
              <span>🧠 3. ST-DBSCAN Scoring</span>
              <span>➔</span>
              <span>🗺️ 4. Map Command Center</span>
              <span>➔</span>
              <span>🚨 5. Police Unit Dispatched</span>
            </div>

            {/* ACTIVE STEP DETAILED DRILLDOWN */}
            {(() => {
              const current = steps.find(s => s.id === activeStep) || steps[0];
              const StepIcon = current.icon;
              return (
                <div className={`p-6 rounded-3xl border transition-all ${
                  themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shadow-md`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${current.bgColor} ${current.textColor} border ${current.borderColor}`}>
                          PHASE {current.id} DETAILED WORKFLOW
                        </span>
                        <h3 className="text-xl font-black mt-1">
                          {current.title} - {current.subtitle}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {current.techStack.map((tech, i) => (
                        <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    {current.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-4 rounded-2xl border ${
                      themeMode === 'ppt' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Input Parameters
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {current.inputs.map((inp, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span>{inp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-4 rounded-2xl border ${
                      themeMode === 'ppt' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Output Artifacts
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {current.outputs.map((out, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-4 rounded-2xl border ${
                      themeMode === 'ppt' ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-950 text-emerald-400 border-slate-800'
                    }`}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        API Payload Spec (JSON)
                      </h4>
                      <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-xl">
                        {JSON.stringify(current.samplePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: CLEAN SYSTEM ARCHITECTURE CHART */}
        {viewTab === 'arch' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                Modular 4-Tier Clean System Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Strict decoupled layers with REST API integration & PostGIS Spatial indexing
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className={`p-5 rounded-2xl border ${
                themeMode === 'ppt' ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-900 border-blue-900/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
                      TIER 1
                    </span>
                    <h3 className="font-extrabold text-base">Frontend User Interface & Map Studio</h3>
                  </div>
                  <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                    Next.js 14 • React 18 • Tailwind CSS • Leaflet/Mapbox
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="font-bold text-blue-900 dark:text-blue-300">Command Center View</div>
                    <div className="text-[11px] text-slate-500">Live operational alerts feed</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="font-bold text-blue-900 dark:text-blue-300">Hotspot 3D Map</div>
                    <div className="text-[11px] text-slate-500">ATM radii & heatmap buffers</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="font-bold text-blue-900 dark:text-blue-300">Counterfactual Studio</div>
                    <div className="text-[11px] text-slate-500">What-if simulation engine</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="font-bold text-blue-900 dark:text-blue-300">Evidence Audit Log</div>
                    <div className="text-[11px] text-slate-500">SHA-256 chain of custody</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-slate-400 font-bold text-sm">⬇️ REST API Protocol (JSON / HTTP 2) ⬇️</div>

              <div className={`p-5 rounded-2xl border ${
                themeMode === 'ppt' ? 'bg-white border-purple-200 shadow-sm' : 'bg-slate-900 border-purple-900/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white">
                      TIER 2
                    </span>
                    <h3 className="font-extrabold text-base">FastAPI REST Backend Core</h3>
                  </div>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                    Python 3.11 • FastAPI • SQLAlchemy 2.0 • Pydantic v2
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                    <div className="font-bold text-purple-900 dark:text-purple-300">/api/v1/incidents</div>
                    <div className="text-[11px] text-slate-500">Complaint ingest & validation</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                    <div className="font-bold text-purple-900 dark:text-purple-300">/api/v1/predictions</div>
                    <div className="text-[11px] text-slate-500">ATM cashout scoring route</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                    <div className="font-bold text-purple-900 dark:text-purple-300">/api/v1/graph</div>
                    <div className="text-[11px] text-slate-500">Mule layering graph API</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                    <div className="font-bold text-purple-900 dark:text-purple-300">/api/v1/audit</div>
                    <div className="text-[11px] text-slate-500">SHA-256 evidence hashing</div>
                  </div>
                </div>
              </div>

              <div className="text-center text-slate-400 font-bold text-sm">⬇️ Spatial Database Queries & ML Model Microservice ⬇️</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${
                  themeMode === 'ppt' ? 'bg-white border-emerald-200 shadow-sm' : 'bg-slate-900 border-emerald-900/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white">
                      TIER 3
                    </span>
                    <h3 className="font-extrabold text-base">Spatial Database Engine</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">PostgreSQL 16 + PostGIS 3.4 Spatial Extension</p>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    <li>• ST_DWithin (500m Proximity Search)</li>
                    <li>• ST_ClusterDBSCAN (Density Hotspots)</li>
                    <li>• GIST Spatial Indexing</li>
                  </ul>
                </div>

                <div className={`p-5 rounded-2xl border ${
                  themeMode === 'ppt' ? 'bg-white border-amber-200 shadow-sm' : 'bg-slate-900 border-amber-900/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white">
                      TIER 4
                    </span>
                    <h3 className="font-extrabold text-base">ML Inference Engine</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Python 3.11 Microservice (Uvicorn Port 8001)</p>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    <li>• ST-DBSCAN Spatio-Temporal Clusterer</li>
                    <li>• XGBoost Cashout Probability Scorer</li>
                    <li>• ATM Distance Decay Risk Model</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DATA PIPELINE SPECIFICATION */}
        {viewTab === 'data' && (
          <div className={`p-6 rounded-3xl border ${
            themeMode === 'ppt' ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
          }`}>
            <h2 className="text-xl font-bold tracking-tight mb-4 text-center">
              Complete Data Flow & Transformation Spec
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60">
                    <th className="p-3 font-extrabold">Stage</th>
                    <th className="p-3 font-extrabold">Input Entity</th>
                    <th className="p-3 font-extrabold">Processing Logic</th>
                    <th className="p-3 font-extrabold">Output Target</th>
                    <th className="p-3 font-extrabold">Latency Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-blue-600">1. Complaint Webhook</td>
                    <td className="p-3 font-mono">NCRP JSON Payload</td>
                    <td className="p-3">Schema validation & PII anonymization</td>
                    <td className="p-3 font-mono">incidents table</td>
                    <td className="p-3 font-mono text-emerald-600">&lt; 15 ms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-purple-600">2. Money Graph Hop</td>
                    <td className="p-3 font-mono">Victim IFSC & Mule Acc</td>
                    <td className="p-3">Multi-hop traversal to detect cashout terminal</td>
                    <td className="p-3 font-mono">mule_graph_nodes</td>
                    <td className="p-3 font-mono text-emerald-600">&lt; 35 ms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-600">3. Spatial Clustering</td>
                    <td className="p-3 font-mono">Mule Lat/Lng + Timestamp</td>
                    <td className="p-3">ST-DBSCAN density clustering & ATM proximity search</td>
                    <td className="p-3 font-mono">predicted_clusters</td>
                    <td className="p-3 font-mono text-emerald-600">&lt; 45 ms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-600">4. Heatmap Rendering</td>
                    <td className="p-3 font-mono">Risk Probability Score</td>
                    <td className="p-3">Leaflet tile layer synthesis & geofence buffer</td>
                    <td className="p-3 font-mono">UI Command Canvas</td>
                    <td className="p-3 font-mono text-emerald-600">&lt; 20 ms</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-rose-600">5. Law Enforcement Alert</td>
                    <td className="p-3 font-mono">High Risk Score (&gt;85%)</td>
                    <td className="p-3">Alert dispatch to nearest Cyber Cell + SHA-256 Hash</td>
                    <td className="p-3 font-mono">evidence_audit_ledger</td>
                    <td className="p-3 font-mono text-emerald-600">&lt; 10 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 font-medium">
          <p>CYBER-PREDICT 360 • Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA) • Problem Statement 26184</p>
        </div>
      </div>
    </div>
  );
}
