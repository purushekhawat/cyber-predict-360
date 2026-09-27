'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

interface HubDetail {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  atms: number;
  complaints: number;
  lossAmount: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  clusterRadius: string;
  topAtm: string;
  elevation: string;
}

interface IncidentPoint {
  lat: number;
  lng: number;
  intensity: number;
  category: string;
  hubId: string;
}

type MapTileStyle = 'google-roadmap' | 'google-satellite' | 'google-terrain' | 'dark-mode' | 'openmaptiles-standard' | 'opentopo-terrain' | 'osm-fr';
type MapDisplayMode = 'HEATMAP' | 'CLUSTERS' | 'BOTH';

export default function HotspotMap() {
  const [selectedHubId, setSelectedHubId] = useState<string>('agra');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('google-roadmap');
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>('BOTH');

  // Heatmap Parameters (HD Sharp Resolution Defaults)
  const [heatRadius, setHeatRadius] = useState<number>(20);
  const [heatBlur, setHeatBlur] = useState<number>(12);
  const [heatIntensity, setHeatIntensity] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [panelPos, setPanelPos] = useState<{ x: number; y: number }>({ x: 24, y: 70 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({ mouseX: 0, mouseY: 0, initialX: 24, initialY: 70 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: panelPos.x,
      initialY: panelPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      setPanelPos({
        x: Math.max(10, Math.min(winW - 300, dragStartRef.current.initialX + dx)),
        y: Math.max(10, Math.min(winH - 350, dragStartRef.current.initialY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging]);

  const snapTopLeft = () => setPanelPos({ x: 20, y: 70 });
  const snapTopRight = () => {
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    setPanelPos({ x: Math.max(20, winW - 310), y: 70 });
  };
  const snapBottomLeft = () => {
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
    setPanelPos({ x: 20, y: Math.max(20, winH - 450) });
  };

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<any[]>([]);
  const heatLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // ResizeObserver guarantees Leaflet map renders tiles instantly when container dimensions change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ pan: false });
      }
    });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const refreshMap = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ pan: false });
      }
    };

    refreshMap();
    const t1 = setTimeout(refreshMap, 50);
    const t2 = setTimeout(refreshMap, 150);
    const t3 = setTimeout(refreshMap, 350);
    const t4 = setTimeout(refreshMap, 650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isFullscreen]);

  const HUBS: HubDetail[] = [
    { id: 'agra', name: 'Agra Cybercrime Hotspot', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, atms: 24, complaints: 168, lossAmount: '₹2.15 Cr', risk: 'CRITICAL', clusterRadius: '2.4 km', topAtm: 'SBI Sanjay Place Main (ATM_AGR_01)', elevation: '171m MSL' },
    { id: 'delhi', name: 'Delhi NCR Hub', state: 'Delhi / Haryana / UP', lat: 28.6139, lng: 77.2090, atms: 22, complaints: 142, lossAmount: '₹1.85 Cr', risk: 'CRITICAL', clusterRadius: '3.2 km', topAtm: 'PNB Connaught Place (ATM_0098)', elevation: '216m MSL' },
    { id: 'jamtara', name: 'Jamtara Belt', state: 'Jharkhand', lat: 24.2167, lng: 86.8000, atms: 18, complaints: 118, lossAmount: '₹1.42 Cr', risk: 'CRITICAL', clusterRadius: '5.8 km', topAtm: 'SBI Main Branch (ATM_0042)', elevation: '172m MSL' },
    { id: 'mewat', name: 'Mewat Cluster', state: 'Haryana / Rajasthan', lat: 28.0000, lng: 77.0000, atms: 17, complaints: 94, lossAmount: '₹98.5 Lakhs', risk: 'CRITICAL', clusterRadius: '4.1 km', topAtm: 'HDFC Nuh Square (ATM_0112)', elevation: '190m MSL' },
    { id: 'mumbai', name: 'Mumbai Metro', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, atms: 18, complaints: 86, lossAmount: '₹2.10 Cr', risk: 'HIGH', clusterRadius: '2.8 km', topAtm: 'ICICI BKC Complex (ATM_0076)', elevation: '14m MSL' },
    { id: 'bengaluru', name: 'Bengaluru Tech', state: 'Karnataka', lat: 12.9716, lng: 77.5946, atms: 16, complaints: 82, lossAmount: '₹1.65 Cr', risk: 'HIGH', clusterRadius: '2.5 km', topAtm: 'Axis Indiranagar (ATM_0021)', elevation: '920m MSL' },
    { id: 'hyderabad', name: 'Hyderabad Cyber', state: 'Telangana', lat: 17.3850, lng: 78.4867, atms: 15, complaints: 78, lossAmount: '₹1.20 Cr', risk: 'MEDIUM', clusterRadius: '3.0 km', topAtm: 'Canara HITECH City (ATM_0055)', elevation: '542m MSL' },
    { id: 'kolkata', name: 'Kolkata East', state: 'West Bengal', lat: 22.5726, lng: 88.3639, atms: 14, complaints: 70, lossAmount: '₹85.0 Lakhs', risk: 'MEDIUM', clusterRadius: '3.5 km', topAtm: 'UBI Salt Lake (ATM_0033)', elevation: '9m MSL' },
  ];

  // Comprehensive nationwide ATM locations dataset
  const ALL_ATMS = [
    // --- AGRA HUB ATMS ---
    { id: 'atm_agr_1', hubId: 'agra', name: 'SBI Sanjay Place Main Branch', bank: 'State Bank of India', location: 'Sanjay Place Commercial Hub, Agra', lat: 27.1982, lng: 78.0058, risk: 'CRITICAL', complaints: 48, loss: '₹62.5 Lakhs' },
    { id: 'atm_agr_2', hubId: 'agra', name: 'PNB Sadar Bazaar Market ATM', bank: 'Punjab National Bank', location: 'MG Road, Sadar Bazaar, Agra', lat: 27.1610, lng: 78.0125, risk: 'CRITICAL', complaints: 36, loss: '₹44.2 Lakhs' },
    { id: 'atm_agr_3', hubId: 'agra', name: 'HDFC Tajganj Tourist Belt', bank: 'HDFC Bank', location: 'Fatehabad Road, Tajganj, Agra', lat: 27.1645, lng: 78.0410, risk: 'HIGH', complaints: 29, loss: '₹38.0 Lakhs' },
    { id: 'atm_agr_4', hubId: 'agra', name: 'Axis Bank Bodla Crossing', bank: 'Axis Bank', location: 'Bodla Crossing, Sikandra Road, Agra', lat: 27.1950, lng: 77.9620, risk: 'CRITICAL', complaints: 41, loss: '₹51.8 Lakhs' },
    { id: 'atm_agr_5', hubId: 'agra', name: 'ICICI Dayalbagh Branch ATM', bank: 'ICICI Bank', location: 'Dayalbagh Road, Agra', lat: 27.2270, lng: 78.0140, risk: 'HIGH', complaints: 24, loss: '₹28.4 Lakhs' },
    { id: 'atm_agr_6', hubId: 'agra', name: 'Canara Bank Agra Cantt', bank: 'Canara Bank', location: 'Agra Cantt Railway Station Road', lat: 27.1580, lng: 77.9940, risk: 'HIGH', complaints: 31, loss: '₹35.6 Lakhs' },
    { id: 'atm_agr_7', hubId: 'agra', name: 'Bank of Baroda Shahganj', bank: 'Bank of Baroda', location: 'Shahganj Market, Agra', lat: 27.1780, lng: 77.9810, risk: 'MEDIUM', complaints: 19, loss: '₹18.9 Lakhs' },
    { id: 'atm_agr_8', hubId: 'agra', name: 'Union Bank Kamla Nagar', bank: 'Union Bank', location: 'Kamla Nagar Bypass, Agra', lat: 27.2180, lng: 78.0280, risk: 'HIGH', complaints: 27, loss: '₹31.0 Lakhs' },
    { id: 'atm_agr_9', hubId: 'agra', name: 'SBI Sikandra Industrial Area', bank: 'State Bank of India', location: 'Sikandra Highway, Agra', lat: 27.2130, lng: 77.9480, risk: 'HIGH', complaints: 22, loss: '₹25.4 Lakhs' },
    { id: 'atm_agr_10', hubId: 'agra', name: 'HDFC Khandari Campus ATM', bank: 'HDFC Bank', location: 'Khandari Crossing, Agra', lat: 27.2110, lng: 78.0020, risk: 'CRITICAL', complaints: 38, loss: '₹47.1 Lakhs' },
    { id: 'atm_agr_11', hubId: 'agra', name: 'PNB Belanganj Branch ATM', bank: 'Punjab National Bank', location: 'Belanganj, Agra', lat: 27.1890, lng: 78.0250, risk: 'MEDIUM', complaints: 16, loss: '₹14.8 Lakhs' },
    { id: 'atm_agr_12', hubId: 'agra', name: 'ICICI Water Works Crossing', bank: 'ICICI Bank', location: 'Water Works Crossing, Agra', lat: 27.2020, lng: 78.0210, risk: 'HIGH', complaints: 25, loss: '₹29.3 Lakhs' },

    // --- DELHI NCR HUB ATMS ---
    { id: 'atm_del_1', hubId: 'delhi', name: 'PNB Connaught Place Inner Circle', bank: 'Punjab National Bank', location: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167, risk: 'CRITICAL', complaints: 52, loss: '₹78.0 Lakhs' },
    { id: 'atm_del_2', hubId: 'delhi', name: 'SBI Chandni Chowk Main', bank: 'State Bank of India', location: 'Chandni Chowk, Old Delhi', lat: 28.6505, lng: 77.2303, risk: 'CRITICAL', complaints: 44, loss: '₹59.2 Lakhs' },
    { id: 'atm_del_3', hubId: 'delhi', name: 'HDFC Nehru Place Tech Tower', bank: 'HDFC Bank', location: 'Nehru Place, New Delhi', lat: 28.5494, lng: 77.2526, risk: 'HIGH', complaints: 33, loss: '₹41.5 Lakhs' },
    { id: 'atm_del_4', hubId: 'delhi', name: 'ICICI Cyber City Gurugram', bank: 'ICICI Bank', location: 'DLF Cyber City, Gurugram', lat: 28.4950, lng: 77.0895, risk: 'CRITICAL', complaints: 47, loss: '₹68.4 Lakhs' },
    { id: 'atm_del_5', hubId: 'delhi', name: 'Axis Bank Sector 18 Noida', bank: 'Axis Bank', location: 'Sector 18 Market, Noida', lat: 28.5700, lng: 77.3260, risk: 'HIGH', complaints: 36, loss: '₹48.0 Lakhs' },

    // --- JAMTARA BELT ATMS ---
    { id: 'atm_jam_1', hubId: 'jamtara', name: 'SBI Main Branch Jamtara', bank: 'State Bank of India', location: 'Main Road Jamtara, Jharkhand', lat: 24.2167, lng: 86.8000, risk: 'CRITICAL', complaints: 64, loss: '₹89.0 Lakhs' },
    { id: 'atm_jam_2', hubId: 'jamtara', name: 'PNB Mihijam Market ATM', bank: 'Punjab National Bank', location: 'Mihijam Market, Jamtara', lat: 23.8500, lng: 86.8800, risk: 'HIGH', complaints: 38, loss: '₹48.2 Lakhs' },
    { id: 'atm_jam_3', hubId: 'jamtara', name: 'BOI Karmatar Station ATM', bank: 'Bank of India', location: 'Karmatar Station Road, Jamtara', lat: 24.0833, lng: 86.7167, risk: 'CRITICAL', complaints: 42, loss: '₹56.0 Lakhs' },

    // --- MEWAT CLUSTER ATMS ---
    { id: 'atm_mew_1', hubId: 'mewat', name: 'HDFC Nuh Square ATM', bank: 'HDFC Bank', location: 'Nuh Main Square, Mewat', lat: 28.1167, lng: 77.0167, risk: 'CRITICAL', complaints: 56, loss: '₹72.0 Lakhs' },
    { id: 'atm_mew_2', hubId: 'mewat', name: 'SBI Ferozepur Jhirka', bank: 'State Bank of India', location: 'Ferozepur Jhirka Market, Mewat', lat: 27.7920, lng: 76.9450, risk: 'HIGH', complaints: 35, loss: '₹43.8 Lakhs' },

    // --- MUMBAI ATMS ---
    { id: 'atm_mum_1', hubId: 'mumbai', name: 'ICICI BKC Complex ATM', bank: 'ICICI Bank', location: 'Bandra Kurla Complex, Mumbai', lat: 19.0657, lng: 72.8686, risk: 'HIGH', complaints: 39, loss: '₹55.0 Lakhs' },
    { id: 'atm_mum_2', hubId: 'mumbai', name: 'HDFC Nariman Point ATM', bank: 'HDFC Bank', location: 'Nariman Point, South Mumbai', lat: 18.9256, lng: 72.8242, risk: 'CRITICAL', complaints: 45, loss: '₹64.2 Lakhs' },

    // --- BENGALURU ATMS ---
    { id: 'atm_blr_1', hubId: 'bengaluru', name: 'Axis Indiranagar 100ft Road', bank: 'Axis Bank', location: '100ft Road Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, risk: 'HIGH', complaints: 34, loss: '₹46.0 Lakhs' },
    { id: 'atm_blr_2', hubId: 'bengaluru', name: 'HDFC Koramangala 5th Block', bank: 'HDFC Bank', location: 'Koramangala 5th Block, Bengaluru', lat: 12.9352, lng: 77.6245, risk: 'CRITICAL', complaints: 41, loss: '₹58.7 Lakhs' },

    // --- HYDERABAD ATMS ---
    { id: 'atm_hyd_1', hubId: 'hyderabad', name: 'SBI HITECH City Main', bank: 'State Bank of India', location: 'HITECH City, Cyberabad', lat: 17.4435, lng: 78.3772, risk: 'MEDIUM', complaints: 28, loss: '₹34.5 Lakhs' },

    // --- KOLKATA ATMS ---
    { id: 'atm_kol_1', hubId: 'kolkata', name: 'Canara Bank Salt Lake Sector V', bank: 'Canara Bank', location: 'Salt Lake Sector V, Kolkata', lat: 22.5780, lng: 88.4320, risk: 'MEDIUM', complaints: 26, loss: '₹32.0 Lakhs' },
  ];

  // Agra Police Stations & Thana Jurisdictions
  const AGRA_POLICE_STATIONS = [
    { id: 'ps_1', name: 'Agra Cyber Crime Police Station', address: 'Police Line, MG Road, Agra', lat: 27.1850, lng: 78.0070, sho: 'Insp. Rajeev Kumar', phone: '0562-2250100', activeCases: 42 },
    { id: 'ps_2', name: 'Hariparwat Police Station', address: 'Sanjay Place Commercial Belt, Agra', lat: 27.2010, lng: 78.0090, sho: 'Insp. Arvind Singh', phone: '0562-2521100', activeCases: 28 },
    { id: 'ps_3', name: 'Tajganj Police Station', address: 'Fatehabad Road, Tajganj, Agra', lat: 27.1610, lng: 78.0430, sho: 'Insp. Manoj Verma', phone: '0562-2230040', activeCases: 21 },
    { id: 'ps_4', name: 'Sikandra Police Station', address: 'NH-19 Sikandra Highway, Agra', lat: 27.2180, lng: 77.9420, sho: 'Insp. Devendra Pal', phone: '0562-2640090', activeCases: 19 },
    { id: 'ps_5', name: 'Sadar Bazaar Police Station', address: 'Agra Cantt Zone, Sadar Bazaar', lat: 27.1590, lng: 78.0100, sho: 'Insp. Rajesh Upadhyay', phone: '0562-2420050', activeCases: 25 },
    { id: 'ps_6', name: 'Shahganj Police Station', address: 'Bichpuri Road, Shahganj, Agra', lat: 27.1750, lng: 77.9780, sho: 'Insp. Sunil Sharma', phone: '0562-2210080', activeCases: 16 },
  ];

  // Specific Agra NCRP Cybercrime Cases Log
  const AGRA_CYBERCRIME_CASES = [
    { ackId: 'ACK2026-AGR-0192', category: 'UPI_FRAUD', title: 'Fake Merchant QR Code Scam at Sanjay Place Market', loss: '₹2,45,000', targetAtm: 'SBI Sanjay Place Main', station: 'Hariparwat PS', status: 'CRITICAL', time: '12 mins ago' },
    { ackId: 'ACK2026-AGR-0412', category: 'OTP_SCAM', title: 'Bank KYC Update APK Malware Cash-out Injection', loss: '₹4,80,000', targetAtm: 'PNB Sadar Bazaar', station: 'Agra Cyber PS', status: 'CRITICAL', time: '28 mins ago' },
    { ackId: 'ACK2026-AGR-0831', category: 'SEXTORTION', title: 'WhatsApp Video Call Blackmail & Mule Account Cashout', loss: '₹1,20,000', targetAtm: 'HDFC Tajganj Tourist Belt', station: 'Tajganj PS', status: 'HIGH', time: '45 mins ago' },
    { ackId: 'ACK2026-AGR-1044', category: 'LOAN_APP', title: 'Illegal Instant Loan App Harassment & Contacts Leak', loss: '₹3,50,000', targetAtm: 'Axis Bank Bodla Crossing', station: 'Sikandra PS', status: 'HIGH', time: '1.2 hrs ago' },
    { ackId: 'ACK2026-AGR-1205', category: 'PHISHING', title: 'Electricity Bill Payment Phishing Link Fraud', loss: '₹1,95,000', targetAtm: 'Canara Bank Agra Cantt', station: 'Sadar Bazaar PS', status: 'MEDIUM', time: '2 hrs ago' },
  ];

  // Generate simulated spatial incident points around Agra and other hubs
  const allIncidents = useMemo<IncidentPoint[]>(() => {
    const centers = [
      { id: 'agra', lat: 27.1767, lng: 78.0081, count: 120, spread: 0.08 },
      { id: 'delhi', lat: 28.6139, lng: 77.2090, count: 110, spread: 0.22 },
      { id: 'jamtara', lat: 24.2167, lng: 86.8000, count: 85, spread: 0.25 },
      { id: 'mewat', lat: 28.0000, lng: 77.0000, count: 75, spread: 0.20 },
      { id: 'mumbai', lat: 19.0760, lng: 72.8777, count: 60, spread: 0.18 },
      { id: 'bengaluru', lat: 12.9716, lng: 77.5946, count: 50, spread: 0.16 },
      { id: 'hyderabad', lat: 17.3850, lng: 78.4867, count: 45, spread: 0.16 },
      { id: 'kolkata', lat: 22.5726, lng: 88.3639, count: 40, spread: 0.18 },
    ];

    const categories = ['UPI_FRAUD', 'OTP_SCAM', 'SEXTORTION', 'PHISHING', 'LOAN_APP'];
    const pts: IncidentPoint[] = [];

    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    centers.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const u1 = rand() || 0.001;
        const u2 = rand();
        const r = Math.sqrt(-2 * Math.log(u1)) * c.spread;
        const theta = 2 * Math.PI * u2;
        const lat = c.lat + r * Math.cos(theta) * 0.7;
        const lng = c.lng + r * Math.sin(theta);
        const intensity = Number((0.35 + rand() * 0.65).toFixed(2));
        const category = categories[Math.floor(rand() * categories.length)];
        pts.push({ lat, lng, intensity, category, hubId: c.id });
      }
    });

    return pts;
  }, []);

  const currentHub = HUBS.find((h) => h.id === selectedHubId) || HUBS[0];
  const filteredHubs = HUBS.filter((h) => filterRisk === 'ALL' || h.risk === filterRisk);

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((p) => {
      if (filterCategory !== 'ALL' && p.category !== filterCategory) return false;
      if (filterRisk !== 'ALL') {
        const hub = HUBS.find((h) => h.id === p.hubId);
        if (hub && hub.risk !== filterRisk) return false;
      }
      return true;
    });
  }, [allIncidents, filterCategory, filterRisk]);

  const getTileUrl = (style: MapTileStyle) => {
    if (style === 'google-satellite') {
      return 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
    } else if (style === 'google-terrain') {
      return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    } else if (style === 'dark-mode') {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    // Default: Google Maps Standard Roadmap
    return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  };

  const getAttribution = () => {
    return '&copy; Google Maps';
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const containerEl = mapContainerRef.current;

    // Load Leaflet dynamically
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      if (!mapRef.current && containerEl) {
        if ((containerEl as any)._leaflet_id) {
          (containerEl as any)._leaflet_id = null;
        }

        const map = L.map(containerEl, {
          center: [27.1767, 78.0081], // Direct Initial Zoom to Agra
          zoom: 12,
          scrollWheelZoom: true,
        });

        const tileLayer = L.tileLayer(getTileUrl(mapStyle), {
          attribution: getAttribution(),
          subdomains: 'abc',
          maxZoom: 19,
        }).addTo(map);

        tileLayerRef.current = tileLayer;
        mapRef.current = map;
      }

      const map = mapRef.current;
      if (!map) return;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);

      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(getTileUrl(mapStyle));
      }

      // Clear previous layers
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // 1. RENDER HEATMAP LAYER (if mode is HEATMAP or BOTH)
      if (displayMode === 'HEATMAP' || displayMode === 'BOTH') {
        const renderHeat = () => {
          if (!containerEl || containerEl.clientWidth === 0 || containerEl.clientHeight === 0) return;

          if ((L as any).heatLayer) {
            // Safeguard L.HeatLayer prototype against getImageData 0 width/height error
            const HeatLayerProto = (L as any).HeatLayer?.prototype || (L as any).heatLayer?.prototype;
            if (HeatLayerProto && !HeatLayerProto._patchedForZeroSize) {
              const origRedraw = HeatLayerProto._redraw;
              if (origRedraw) {
                HeatLayerProto._redraw = function (...args: any[]) {
                  if (!this._map) return;
                  const sz = this._map.getSize();
                  if (!sz || sz.x === 0 || sz.y === 0) return;
                  try {
                    return origRedraw.apply(this, args);
                  } catch (e) {
                    // Prevent IndexSizeError from bubbling up when canvas size is 0
                  }
                };
              }
              HeatLayerProto._patchedForZeroSize = true;
            }

            try {
              const heatData = filteredIncidents.map((p) => [p.lat, p.lng, p.intensity * heatIntensity]);
              const heatLayer = (L as any).heatLayer(heatData, {
                radius: heatRadius,
                blur: heatBlur,
                minOpacity: 0.3,
                maxZoom: 18,
                max: 0.75,
                gradient: {
                  0.15: '#2563eb',
                  0.35: '#06b6d4',
                  0.55: '#10b981',
                  0.75: '#f59e0b',
                  0.95: '#dc2626',
                },
              }).addTo(map);
              heatLayerRef.current = heatLayer;
            } catch (e) {
              console.warn('Heatmap layer render deferred due to 0 size canvas:', e);
            }
          } else {
            // Fallback: render compact gradient circle overlays for each incident point
            filteredIncidents.forEach((p) => {
              const alpha = Math.min(0.4, p.intensity * 0.35);
              const color = p.intensity > 0.75 ? '#dc2626' : p.intensity > 0.5 ? '#f59e0b' : '#2563eb';
              const circle = L.circle([p.lat, p.lng], {
                color: 'transparent',
                fillColor: color,
                fillOpacity: alpha,
                radius: 350 * p.intensity,
              }).addTo(map);
              layersRef.current.push(circle);
            });
          }
        };

        // Check if leaflet.heat script is loaded, if not load it on demand
        if (!(L as any).heatLayer && !document.getElementById('leaflet-heat-script')) {
          const script = document.createElement('script');
          script.id = 'leaflet-heat-script';
          script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          script.onload = () => {
            renderHeat();
          };
          document.body.appendChild(script);
        } else {
          renderHeat();
        }
      }

      // 2. RENDER CLUSTERS & HUB BADGES (if mode is CLUSTERS or BOTH)
      if (displayMode === 'CLUSTERS' || displayMode === 'BOTH') {
        filteredHubs.forEach((hub) => {
          const color = hub.risk === 'CRITICAL' ? '#dc2626' : hub.risk === 'HIGH' ? '#d97706' : '#2563eb';

          // DBSCAN Cluster Boundary Ring (Neat 3km outline around hub without washing out map in pink)
          const circle = L.circle([hub.lat, hub.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.04,
            weight: 2,
            dashArray: '5, 5',
            radius: hub.risk === 'CRITICAL' ? 3500 : hub.risk === 'HIGH' ? 2500 : 1800,
          }).addTo(map);

          // Permanent Floating City Badge
          const cityBadgeIcon = L.divIcon({
            className: 'custom-city-badge',
            html: `
              <div style="
                background-color: #0f172a;
                color: #ffffff;
                padding: 4px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 800;
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                border: 2px solid ${color};
                box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.4);
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 6px;
                transform: translate(-50%, -120%);
                cursor: pointer;
              ">
                <span style="width:8px; height:8px; border-radius:50%; background-color:${color}; display:inline-block; box-shadow: 0 0 8px ${color};"></span>
                <span>${hub.name}</span>
                <span style="background-color:rgba(255,255,255,0.18); padding:1px 5px; border-radius:4px; font-size:10px; color:${color}; font-weight:bold;">${hub.complaints}</span>
              </div>
            `,
            iconSize: [120, 32],
            iconAnchor: [60, 16],
          });

          const labelMarker = L.marker([hub.lat, hub.lng], { icon: cityBadgeIcon }).addTo(map);

          labelMarker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 200px;">
              <strong style="color: #0f172a; font-size: 14px;">${hub.name}</strong><br/>
              <span style="font-size: 11px; color: #64748b;">${hub.state} • Elev: ${hub.elevation}</span>
              <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
              <span style="color: #dc2626; font-weight: bold; font-size: 11px;">Complaints: ${hub.complaints} Incidents</span><br/>
              <span style="color: #059669; font-weight: bold; font-size: 11px;">Loss Magnitude: ${hub.lossAmount}</span><br/>
              <span style="color: #2563eb; font-weight: bold; font-size: 10px;">Top Target Node: ${hub.topAtm}</span>
            </div>
          `);

          labelMarker.on('click', () => {
            setSelectedHubId(hub.id);
          });

          layersRef.current.push(circle, labelMarker);
        });

        // 3. RENDER ALL NATIONWIDE ATM MARKERS ON MAP (Compact Pin Design)
        ALL_ATMS.forEach((atm) => {
          const pinColor = atm.risk === 'CRITICAL' ? '#dc2626' : atm.risk === 'HIGH' ? '#d97706' : '#2563eb';
          const atmIcon = L.divIcon({
            className: 'custom-atm-badge',
            html: `
              <div style="
                background: #ffffff;
                color: #0f172a;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2.5px solid ${pinColor};
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                transform: translate(-50%, -50%);
              " title="${atm.name} (${atm.complaints} Cases)">
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${pinColor};"></div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const atmMarker = L.marker([atm.lat, atm.lng], { icon: atmIcon }).addTo(map);
          atmMarker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 210px;">
              <span style="background-color: ${pinColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">
                ${atm.risk} CASH-OUT RISK
              </span>
              <h4 style="margin-top: 6px; font-size: 13px; font-weight: bold; color: #0f172a;">${atm.name}</h4>
              <p style="font-size: 11px; color: #64748b; margin-top: 2px;">${atm.location}</p>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;" />
              <div style="font-size: 11px; space-y: 2px;">
                <div>Bank: <strong style="color: #0f172a;">${atm.bank}</strong></div>
                <div>Flagged Complaints: <strong style="color: #dc2626;">${atm.complaints} Incidents</strong></div>
                <div>Withdrawal Loss: <strong style="color: #059669;">${atm.loss}</strong></div>
                <div>Coordinates: <span style="color: #2563eb;">${atm.lat.toFixed(4)}, ${atm.lng.toFixed(4)}</span></div>
              </div>
            </div>
          `);
          layersRef.current.push(atmMarker);
        });

        // 4. RENDER AGRA POLICE STATIONS ON MAP (Compact Pin Design)
        AGRA_POLICE_STATIONS.forEach((ps) => {
          const psIcon = L.divIcon({
            className: 'custom-ps-badge',
            html: `
              <div style="
                background: #0f172a;
                color: #ffffff;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2.5px solid #38bdf8;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                cursor: pointer;
                transform: translate(-50%, -50%);
              " title="${ps.name} (${ps.activeCases} Cases)">
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #38bdf8;"></div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const psMarker = L.marker([ps.lat, ps.lng], { icon: psIcon }).addTo(map);
          psMarker.bindPopup(`
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 220px;">
              <span style="background-color: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold;">
                POLICE JURISDICTION STATION
              </span>
              <h4 style="margin-top: 6px; font-size: 13px; font-weight: bold; color: #0f172a;">${ps.name}</h4>
              <p style="font-size: 11px; color: #64748b; margin-top: 2px;">${ps.address}</p>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #e2e8f0;" />
              <div style="font-size: 11px; space-y: 2px;">
                <div>Station In-Charge (SHO): <strong style="color: #0f172a;">${ps.sho}</strong></div>
                <div>Helpline Direct: <strong style="color: #2563eb;">${ps.phone}</strong></div>
                <div>Active Cyber Investigations: <strong style="color: #dc2626;">${ps.activeCases} Cases</strong></div>
              </div>
            </div>
          `);
          layersRef.current.push(psMarker);
        });
      }
    });
  }, [mapStyle, filterRisk, filterCategory, displayMode, heatRadius, heatBlur, heatIntensity, filteredHubs, filteredIncidents]);

  const handleSelectHub = (hub: HubDetail) => {
    setSelectedHubId(hub.id);
    if (mapRef.current) {
      mapRef.current.flyTo([hub.lat, hub.lng], 12, { duration: 1.5 });
    }
  };

  const handleCityChange = (cityId: string) => {
    if (cityId === 'ALL_INDIA') {
      if (mapRef.current) {
        mapRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.5 });
      }
    } else {
      const hub = HUBS.find((h) => h.id === cityId);
      if (hub) {
        setSelectedHubId(hub.id);
        if (mapRef.current) {
          mapRef.current.flyTo([hub.lat, hub.lng], 12, { duration: 1.5 });
        }
      }
    }
  };

  const handleResetZoom = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  };

  const toggleFullscreen = () => {
    const container = canvasContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => setIsFullscreen(true));
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setIsFullscreen(false));
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else {
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pb-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#9a7547] tracking-tight">
              Cybercrime Incident Density Heatmap & Spatial Radar
            </h2>
            <p className="text-gray-500 text-xs mt-1 font-medium">
              Spatial-Temporal Kernel Density Estimation (KDE) across {filteredIncidents.length} complaint incident points
            </p>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setMapStyle('google-roadmap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapStyle === 'google-roadmap' ? 'bg-[#9a7547] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Google Maps
              </button>

              <button
                onClick={() => setMapStyle('google-satellite')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapStyle === 'google-satellite' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Satellite
              </button>

              <button
                onClick={() => setMapStyle('google-terrain')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapStyle === 'google-terrain' ? 'bg-amber-700 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Terrain
              </button>

              <button
                onClick={() => setMapStyle('dark-mode')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  mapStyle === 'dark-mode' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Dark Mode
              </button>
            </div>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              Back to Dashboard
            </Link>

            <button
              onClick={handleResetZoom}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 transition-all shadow-xs"
            >
              Full India View
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs pb-2">

        {/* City / Hotspot Region Selector */}
        <div className="relative z-10">
          <label className="text-[10px] font-extrabold uppercase text-[#9a7547] block mb-1.5 flex items-center gap-1">
            Select City / Region
          </label>
          <select
            value={selectedHubId}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full bg-white border-2 border-[#9a7547] text-[#9a7547] rounded-xl p-2 font-black focus:ring-2 focus:ring-[#9a7547] outline-none shadow-xs cursor-pointer"
          >
            <option value="ALL_INDIA">All India (Nationwide)</option>
            <option value="agra">Agra (UP) - Hotspot</option>
            <option value="delhi">Delhi NCR</option>
            <option value="jamtara">Jamtara Belt (Jharkhand)</option>
            <option value="mewat">Mewat Cluster (Haryana/Raj)</option>
            <option value="mumbai">Mumbai Metro</option>
            <option value="bengaluru">Bengaluru Tech</option>
            <option value="hyderabad">Hyderabad Cyber</option>
            <option value="kolkata">Kolkata East</option>
          </select>
        </div>

        {/* Layer View Mode */}
        <div className="relative z-10">
          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1.5">Visualization Overlay</label>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 font-bold">
            <button
              onClick={() => setDisplayMode('HEATMAP')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'HEATMAP' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setDisplayMode('CLUSTERS')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'CLUSTERS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Clusters
            </button>
            <button
              onClick={() => setDisplayMode('BOTH')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'BOTH' ? 'bg-[#9a7547] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Crime Category Filter */}
        <div className="relative z-10">
          <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1.5">Crime Category Filter</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-[#9a7547] outline-none"
          >
            <option value="ALL">ALL CATEGORIES ({allIncidents.length} points)</option>
            <option value="UPI_FRAUD">UPI Payment Fraud</option>
            <option value="OTP_SCAM">OTP / Vishing Scam</option>
            <option value="SEXTORTION">Sextortion / Blackmail</option>
            <option value="PHISHING">Phishing Link / Malicious APK</option>
            <option value="LOAN_APP">Illegal Loan App Extortion</option>
          </select>
        </div>

        {/* Heat Radius Slider */}
        <div className="relative z-10">
          <div className="flex justify-between text-[10px] font-extrabold uppercase text-gray-400 mb-1.5">
            <span>Heat Dispersion Radius</span>
            <span className="text-[#9a7547] font-bold">{heatRadius}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="50"
            value={heatRadius}
            onChange={(e) => setHeatRadius(Number(e.target.value))}
            className="w-full accent-[#9a7547] cursor-pointer mt-2"
          />
        </div>

        {/* Heat Blur Slider */}
        <div className="relative z-10">
          <div className="flex justify-between text-[10px] font-extrabold uppercase text-gray-400 mb-1.5">
            <span>Thermal Gradient Blur</span>
            <span className="text-[#9a7547] font-bold">{heatBlur}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="35"
            value={heatBlur}
            onChange={(e) => setHeatBlur(Number(e.target.value))}
            className="w-full accent-[#9a7547] cursor-pointer mt-2"
          />
        </div>
      </div>

      {/* Full-Width Interactive Spatial Heatmap Canvas */}
      <div
        ref={canvasContainerRef}
        className={`bg-white border border-gray-200 rounded-2xl shadow-sm transition-all duration-200 relative overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 z-[99990] w-screen h-screen p-3 flex flex-col space-y-3 bg-white'
            : 'w-full h-[680px] p-4 flex flex-col space-y-3'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3 relative z-10 shrink-0 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#9a7547] uppercase tracking-wider flex items-center gap-2">
              DYNAMIC SPATIAL HEATMAP ({filteredIncidents.length} ACTIVE INCIDENT NODES)
            </h3>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Thermal Legend Bar */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-gray-400">LOW</span>
              <div className="w-36 h-3 rounded overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-400 via-green-400 via-yellow-400 to-red-600 border border-slate-300"></div>
              <span className="text-red-600 font-extrabold">CRITICAL HOTSPOT</span>
            </div>

            {/* Full Screen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>
          </div>
        </div>

        {/* Leaflet Map DOM Element Container */}
        <div
          ref={mapContainerRef}
          className="flex-1 w-full h-full min-h-0 relative rounded-xl border-2 border-white shadow-md bg-slate-100 overflow-hidden z-0"
        />

        {/* Movable Vertical Floating Control Panel (Active in BOTH Normal & Full Screen Mode) */}
        <div
          style={{ left: `${panelPos.x}px`, top: `${panelPos.y}px` }}
          className={`${
            isFullscreen ? 'fixed z-[100000]' : 'absolute z-30'
          } w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs max-h-[calc(100%-80px)] overflow-y-auto select-none`}
        >
            {/* Draggable Header Grip */}
            <div
              onMouseDown={handleDragStart}
              className="flex justify-between items-center bg-slate-100 p-2.5 -mx-4 -mt-4 rounded-t-2xl border-b border-slate-200 cursor-grab active:cursor-grabbing hover:bg-slate-200/80 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-extrabold text-sm tracking-tighter">⠿⠿</span>
                <div>
                  <h4 className="font-extrabold text-[#9a7547] text-xs uppercase tracking-wider">Drag Map Controls</h4>
                  <p className="text-[9px] text-gray-500 font-medium">Click & Drag to Move Panel</p>
                </div>
              </div>
              <button
                onClick={toggleFullscreen}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[10px] shadow-xs cursor-pointer"
              >
                Exit
              </button>
            </div>

            {/* Quick Corner Snap Shortcuts */}
            <div className="flex gap-1 justify-between text-[9px] font-extrabold text-slate-500 pt-0.5">
              <span>Snap Position:</span>
              <button onClick={snapTopLeft} className="text-blue-600 hover:underline cursor-pointer">Top-Left</button>
              <button onClick={snapTopRight} className="text-blue-600 hover:underline cursor-pointer">Top-Right</button>
              <button onClick={snapBottomLeft} className="text-blue-600 hover:underline cursor-pointer">Bottom-Left</button>
            </div>

            {/* 1. Select City / Region */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-[#9a7547] block">Select City / Region</label>
              <select
                value={selectedHubId}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-white border border-[#9a7547] text-[#9a7547] rounded-xl p-2 font-extrabold outline-none shadow-xs cursor-pointer"
              >
                <option value="ALL_INDIA">All India (Nationwide)</option>
                <option value="agra">Agra (UP) - Hotspot</option>
                <option value="delhi">Delhi NCR</option>
                <option value="jamtara">Jamtara Belt (Jharkhand)</option>
                <option value="mewat">Mewat Cluster (Haryana/Raj)</option>
                <option value="mumbai">Mumbai Metro</option>
                <option value="bengaluru">Bengaluru Tech</option>
                <option value="hyderabad">Hyderabad Cyber</option>
                <option value="kolkata">Kolkata East</option>
              </select>
            </div>

            {/* 2. Map Layer Theme */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400 block">Map Layer Theme</label>
              <div className="grid grid-cols-2 gap-1.5 font-bold">
                <button
                  onClick={() => setMapStyle('google-roadmap')}
                  className={`p-1.5 rounded-lg text-center transition-all ${mapStyle === 'google-roadmap' ? 'bg-[#9a7547] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Google Maps
                </button>
                <button
                  onClick={() => setMapStyle('google-satellite')}
                  className={`p-1.5 rounded-lg text-center transition-all ${mapStyle === 'google-satellite' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapStyle('google-terrain')}
                  className={`p-1.5 rounded-lg text-center transition-all ${mapStyle === 'google-terrain' ? 'bg-amber-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Terrain
                </button>
                <button
                  onClick={() => setMapStyle('dark-mode')}
                  className={`p-1.5 rounded-lg text-center transition-all ${mapStyle === 'dark-mode' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Dark Mode
                </button>
              </div>
            </div>

            {/* 3. Visualization Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400 block">Overlay Mode</label>
              <div className="flex bg-slate-100 p-1 rounded-xl font-bold">
                <button
                  onClick={() => setDisplayMode('HEATMAP')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'HEATMAP' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  Heatmap
                </button>
                <button
                  onClick={() => setDisplayMode('CLUSTERS')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'CLUSTERS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'}`}
                >
                  Clusters
                </button>
                <button
                  onClick={() => setDisplayMode('BOTH')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all ${displayMode === 'BOTH' ? 'bg-[#9a7547] text-white shadow-xs' : 'text-slate-600'}`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* 4. Crime Category Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-gray-400 block">Crime Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none"
              >
                <option value="ALL">ALL CATEGORIES ({allIncidents.length} points)</option>
                <option value="UPI_FRAUD">UPI Payment Fraud</option>
                <option value="OTP_SCAM">OTP / Vishing Scam</option>
                <option value="SEXTORTION">Sextortion / Blackmail</option>
                <option value="PHISHING">Phishing Link / Malicious APK</option>
                <option value="LOAN_APP">Illegal Loan App Extortion</option>
              </select>
            </div>

            {/* 5. Heat Sliders */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div>
                <div className="flex justify-between text-[10px] font-extrabold uppercase text-gray-400">
                  <span>Heat Dispersion Radius</span>
                  <span className="text-[#9a7547] font-bold">{heatRadius}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="50"
                  value={heatRadius}
                  onChange={(e) => setHeatRadius(Number(e.target.value))}
                  className="w-full accent-[#9a7547] cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-extrabold uppercase text-gray-400">
                  <span>Thermal Gradient Blur</span>
                  <span className="text-[#9a7547] font-bold">{heatBlur}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={heatBlur}
                  onChange={(e) => setHeatBlur(Number(e.target.value))}
                  className="w-full accent-[#9a7547] cursor-pointer mt-1"
                />
              </div>
            </div>

            {/* 6. Quick Action Buttons */}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleResetZoom}
                className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 text-center transition-all"
              >
                Full India View
              </button>
            </div>
          </div>
      </div>

      {/* Selected Hub Detailed Analytics Grid Row */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">

        <div className="flex justify-between items-center border-b border-gray-100 pb-3 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Zone Analysis Overview</span>
            <h3 className="text-xl font-extrabold text-[#9a7547]">{currentHub.name}</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
              currentHub.risk === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200'
                : currentHub.risk === 'HIGH'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            {currentHub.risk} RISK ZONE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs relative z-10">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">State / Region:</span>
            <span className="text-gray-900 font-extrabold text-sm">{currentHub.state}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">Elevation / Topo:</span>
            <span className="text-blue-700 font-extrabold text-sm">{currentHub.elevation}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">Total Cyber Complaints:</span>
            <span className="text-red-600 font-black text-sm">{currentHub.complaints} Incidents</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">Total Financial Loss:</span>
            <span className="text-emerald-700 font-extrabold text-sm">{currentHub.lossAmount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">DBSCAN Cluster Radius:</span>
            <span className="text-blue-700 font-extrabold text-sm">{currentHub.clusterRadius}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
            <span className="text-gray-500 font-bold">Active ATM Nodes:</span>
            <span className="text-gray-900 font-extrabold text-sm">{currentHub.atms} Locations</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 relative z-10">
          <span className="text-gray-700 text-xs font-bold">Top Predicted Target ATM:</span>
          <span className="text-[#9a7547] font-black text-sm">
            {currentHub.topAtm}
          </span>
        </div>
      </div>

      {/* Dedicated Agra Police Stations & NCRP Cybercrime Cases Log Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Agra Police Jurisdictions & Investigation Log</span>
            <h3 className="text-lg font-extrabold text-[#9a7547] flex items-center gap-2">
              Agra Police Stations & NCRP Cybercrime Complaints
            </h3>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            6 ACTIVE THANAS • 5 FLAGGED CASES
          </span>
        </div>

        {/* Police Station Jurisdiction Cards */}
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Agra Police Thanas & SHO Contacts</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGRA_POLICE_STATIONS.map((ps) => (
              <div key={ps.id} className="p-4 rounded-xl bg-white border border-gray-200 space-y-2.5 hover:border-[#9a7547]/40 transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    {ps.name}
                  </h4>
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                    {ps.activeCases} Cases
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{ps.address}</p>
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-600 flex justify-between items-center">
                  <span>SHO: <strong className="text-gray-900">{ps.sho}</strong></span>
                  <span className="text-blue-700 font-bold">{ps.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agra NCRP Cases Table */}
        <div className="space-y-3 relative z-10 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Agra Live Cybercrime Complaints Log</span>
            <span className="text-[11px] text-gray-400">Filter: AGRA ZONE</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">ACK ID</th>
                  <th className="py-3 px-4">Fraud Category</th>
                  <th className="py-3 px-4">Incident Title</th>
                  <th className="py-3 px-4">Target ATM</th>
                  <th className="py-3 px-4">Financial Loss</th>
                  <th className="py-3 px-4">Jurisdiction Thana</th>
                  <th className="py-3 px-4">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AGRA_CYBERCRIME_CASES.map((c) => (
                  <tr key={c.ackId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-700">{c.ackId}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-high">{c.category}</span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{c.title}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold">{c.targetAtm}</td>
                    <td className="py-3 px-4 text-red-600 font-extrabold">{c.loss}</td>
                    <td className="py-3 px-4 text-slate-700 font-bold">{c.station}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        c.status === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hotspot Regional Matrix Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">

        <div className="flex justify-between items-center border-b border-gray-100 pb-3 relative z-10">
          <h3 className="text-sm font-extrabold text-[#9a7547] uppercase tracking-wider">
            Regional Cybercrime Hotspot Matrix ({filteredHubs.length} Key Hubs)
          </h3>
          <span className="text-xs text-gray-400">Order by Incident Density</span>
        </div>

        <div className="overflow-x-auto relative z-10 border border-gray-200 rounded-xl bg-white">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Regional Hub</th>
                <th className="py-3 px-4">State / Territory</th>
                <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                <th className="py-3 px-4">Total Complaints</th>
                <th className="py-3 px-4">Financial Loss</th>
                <th className="py-3 px-4">Risk Rating</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHubs.map((h) => (
                <tr key={h.id} className={`hover:bg-amber-50/30 transition-colors ${h.id === selectedHubId ? 'bg-amber-50/60 font-bold' : ''}`}>
                  <td className="py-3 px-4 font-bold text-slate-900">{h.name}</td>
                  <td className="py-3 px-4 text-slate-600">{h.state}</td>
                  <td className="py-3 px-4 text-blue-700">
                    {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-red-600 font-bold">{h.complaints}</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">{h.lossAmount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        h.risk === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : h.risk === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {h.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleSelectHub(h)}
                      className="px-3 py-1 bg-[#9a7547] hover:bg-[#8f6a27] text-white font-bold rounded-lg text-[10px] transition-all shadow-xs"
                    >
                      Focus & Fly To
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
