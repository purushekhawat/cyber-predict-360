'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  MapPin, 
  Database, 
  Activity, 
  BarChart2, 
  AlertTriangle, 
  Globe, 
  RefreshCw, 
  Sliders, 
  FileText, 
  UserCheck, 
  Layers, 
  ChevronRight,
  Siren,
  Building2,
  User,
  CheckCircle2,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';

export type DashboardPage = 
  | 'command' 
  | 'police'
  | 'bank'
  | 'heatmap' 
  | 'investigation' 
  | 'graph' 
  | 'prediction' 
  | 'simulation' 
  | 'alerts' 
  | 'evidence' 
  | 'performance';

interface DashboardLayoutProps {
  activePage?: DashboardPage;
  onPageChange?: (page: DashboardPage) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({ activePage: activePageProp, onPageChange, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getActivePageFromPath = (): DashboardPage => {
    if (activePageProp) return activePageProp;
    if (pathname === '/police') return 'police';
    if (pathname === '/bank') return 'bank';
    if (pathname === '/heatmap') return 'heatmap';
    if (pathname === '/prediction') return 'prediction';
    if (pathname === '/investigation') return 'investigation';
    if (pathname === '/graph') return 'graph';
    if (pathname === '/simulation') return 'simulation';
    if (pathname === '/alerts') return 'alerts';
    if (pathname === '/evidence') return 'evidence';
    if (pathname === '/performance') return 'performance';
    return 'command';
  };

  const activePage = getActivePageFromPath();

  const navItems = [
    { id: 'command' as DashboardPage, href: '/', label: 'Home Dashboard', icon: LayoutGridIcon },
    { id: 'heatmap' as DashboardPage, href: '/heatmap', label: 'Spatial Hotspots Map', icon: MapIcon },
    { id: 'prediction' as DashboardPage, href: '/prediction', label: 'ML ATM Predictions', icon: TargetIcon },
    { id: 'investigation' as DashboardPage, href: '/investigation', label: 'NCRP Complaints Log', icon: FileTextIcon },
    { id: 'graph' as DashboardPage, href: '/graph', label: 'Financial Trail Graph', icon: NetworkIcon },
    { id: 'simulation' as DashboardPage, href: '/simulation', label: 'Counterfactual Studio', icon: FlaskIcon },
    { id: 'alerts' as DashboardPage, href: '/alerts', label: 'Operational Alerts Feed', icon: AlertIcon, badge: '14' },
    { id: 'evidence' as DashboardPage, href: '/evidence', label: 'Evidence Audit Log', icon: AuditIcon },
    { id: 'performance' as DashboardPage, href: '/performance', label: 'ML Engine Performance', icon: GaugeIcon },
  ];

  return (
    <div className="dashboard-layout bg-white min-h-screen flex">
      {/* Research Portal Left Sidebar */}
      <aside className="w-64 flex flex-col justify-between py-4 flex-shrink-0 hidden md:flex border-r border-gray-200 bg-white h-screen sticky top-0">
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {/* University / Agency Brand Seal Header */}
          <div className="flex flex-col items-center justify-center w-full px-4 mb-6 mt-2 text-center shrink-0">
            <h1 className="text-sm font-extrabold text-[#9a7547] tracking-wider uppercase">
              CYBER-PREDICT 360
            </h1>
            <span className="text-[10px] text-gray-500 font-medium">
              I4C • MHA • PS ID 26184
            </span>
          </div>

          {/* Sidebar Menu Navigation */}
          <nav className="space-y-0.5 flex-1" id="sidebar-nav">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Core Modules
            </div>

            {navItems.map((item) => {
              const isActive = activePage === item.id;
              const IconComp = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onPageChange) onPageChange(item.id);
                  }}
                  className={`w-full sidebar-link rounded-none flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {IconComp && <IconComp className="w-5 h-5 shrink-0" />}
                    <span className="font-bold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-500 font-medium">
          <span className="font-bold text-[#9a7547] block mb-0.5">LAW ENFORCEMENT ADMIN</span>
          Predictive spatial framework active. Time: {timeStr}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Research Portal Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center border-b border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 hover:bg-amber-100 text-[#9a7547] font-extrabold text-xs transition-all shadow-xs"
              >
                <LayoutGrid className="w-4 h-4 text-[#9a7547]" />
                <span>CENTRAL COMMAND PORTAL</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* Portal Switcher Dropdown */}
              {portalDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    Switch Active Portal
                  </div>
                  <Link
                    href="/"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-50 text-[#9a7547] font-bold border border-amber-200"
                  >
                    <LayoutGrid className="w-4 h-4 text-[#9a7547]" />
                    <div>
                      <div>Central Command Portal</div>
                      <span className="text-[10px] text-gray-500 font-normal">Full Intelligence Dashboard</span>
                    </div>
                  </Link>
                  <Link
                    href="/police"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 font-bold"
                  >
                    <Siren className="w-4 h-4 text-red-600" />
                    <div>
                      <div>Police Patrol Portal</div>
                      <span className="text-[10px] text-gray-500 font-normal">Live Field Dispatch & PCR Vans</span>
                    </div>
                  </Link>
                  <Link
                    href="/bank"
                    onClick={() => setPortalDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 font-bold"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>Bank Nodal Portal</div>
                      <span className="text-[10px] text-gray-500 font-normal">Mule Account Lien & ATM Controls</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs">

            {/* Dedicated 3D Map Studio */}
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-xl bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Globe className="w-4 h-4" />
              <span>Dedicated 3D Map</span>
            </Link>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Admin Avatar */}
            <div className="w-9 h-9 rounded-full bg-amber-100 text-[#9a7547] border border-amber-300 flex items-center justify-center font-extrabold text-sm shadow-xs">
              <User className="w-5 h-5 text-[#9a7547]" />
            </div>
          </div>
        </header>

        {/* Mobile Nav Bar */}
        <div className="md:hidden border-b border-gray-200 p-2 flex overflow-x-auto gap-2 bg-gray-50">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (onPageChange) onPageChange(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activePage === item.id ? 'bg-[#9a7547] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Icon Components
function LayoutGridIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function MapIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  );
}

function TargetIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function NetworkIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function FlaskIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.022.547l-1.378 1.378a2 2 0 00.586 3.414l7 2.333a2 2 0 001.264 0l7-2.333a2 2 0 00.586-3.414l-1.378-1.378z" />
    </svg>
  );
}

function AlertIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function AuditIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GaugeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
