'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Lock, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  TrendingUp, 
  MapPin,
  Globe, 
  RefreshCw, 
  User, 
  ChevronDown,
  Siren,
  LayoutGrid
} from 'lucide-react';

interface BankLayoutProps {
  children: React.ReactNode;
}

export default function BankLayout({ children }: BankLayoutProps) {
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

  const bankNavItems = [
    { href: '/bank', label: 'Mule Account Lien Queue', icon: Lock, badge: 'ACTION' },
    { href: '/bank/limits', label: 'ATM Cash-Out Cap Controls', icon: SlidersHorizontal },
    { href: '/bank/analytics', label: 'Fraud Loss Exposure Analytics', icon: TrendingUp },
    { href: '/bank/fiu', label: 'RBI / FIU SAR Compliance', icon: FileSpreadsheet },
    { href: '/bank/network', label: 'Bank Nodal Network Nodes', icon: Building2 },
    { href: '/bank/map', label: 'Spatial Risk Heatmap Radar', icon: MapPin },
  ];

  return (
    <div className="bank-layout bg-white min-h-screen flex">
      {/* Dedicated Bank Nodal Light Sidebar */}
      <aside className="w-64 flex flex-col justify-between py-4 flex-shrink-0 hidden md:flex border-r border-gray-200 bg-white h-screen sticky top-0">
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Bank Nodal Brand Header */}
          <div className="flex flex-col items-center justify-center w-full px-4 mb-6 mt-2 text-center shrink-0">
            <h1 className="text-sm font-extrabold text-[#9a7547] tracking-wider uppercase flex items-center gap-1.5">
              CYBER-PREDICT 360
            </h1>
            <span className="text-[10px] text-gray-500 font-medium">
              BANK NODAL • PS ID 26184
            </span>
          </div>

          {/* Dedicated Bank Portal Sidebar Menu */}
          <nav className="space-y-0.5 flex-1" id="sidebar-nav">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Nodal Banking Menu
            </div>

            {bankNavItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComp = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full sidebar-link rounded-none flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#9a7547]' : 'text-slate-500'}`} />
                    <span className="font-bold text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
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
        
        {/* Sticky Top Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center border-b border-gray-100 shadow-xs">
          
          {/* Left Portal Switcher */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition-all shadow-xs"
              >
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>CYBER-PREDICT 360 • BANK PORTAL</span>
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
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 text-gray-800 font-bold"
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
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                  >
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <div>
                      <div>Bank Nodal Portal</div>
                      <span className="text-[10px] text-indigo-700 font-normal">Mule Account Lien & ATM Controls</span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Quick Links */}
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/map"
              className="px-3.5 py-2 rounded-xl bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 text-xs"
            >
              <Globe className="w-4 h-4" />
              <span>3D Radar Map</span>
            </Link>

            <button
              onClick={handleRefresh}
              className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300 flex items-center justify-center font-extrabold text-sm shadow-xs">
              <User className="w-5 h-5 text-indigo-700" />
            </div>
          </div>
        </header>

        {/* Mobile Bank Navigation */}
        <div className="md:hidden border-b border-gray-200 p-2 flex overflow-x-auto gap-2 bg-gray-50">
          {bankNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                pathname === item.href ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
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
