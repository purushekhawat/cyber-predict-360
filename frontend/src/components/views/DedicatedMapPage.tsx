'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

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

type MapTileStyle = 'google-roadmap' | 'google-satellite' | 'google-terrain' | 'dark-mode';

export default function DedicatedMapPage() {
  const [selectedHubId, setSelectedHubId] = useState<string>('delhi');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('google-roadmap');

  // Layer Visibility Toggle States
  const [showAtmLayer, setShowAtmLayer] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showHeatCircles, setShowHeatCircles] = useState<boolean>(true);

  // Heatmap Controls
  const [heatRadius, setHeatRadius] = useState<number>(30);
  const [heatBlur, setHeatBlur] = useState<number>(20);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<any[]>([]);
  const heatLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const HUBS: HubDetail[] = [
    { id: 'delhi', name: 'Delhi NCR Hub', state: 'Delhi / Haryana / UP', lat: 28.6139, lng: 77.2090, atms: 22, complaints: 142, lossAmount: '₹1.85 Cr', risk: 'CRITICAL', clusterRadius: '3.2 km', topAtm: 'PNB Connaught Place (ATM_0098)', elevation: '216m MSL' },
    { id: 'jamtara', name: 'Jamtara Belt', state: 'Jharkhand', lat: 24.2167, lng: 86.8000, atms: 18, complaints: 118, lossAmount: '₹1.42 Cr', risk: 'CRITICAL', clusterRadius: '5.8 km', topAtm: 'SBI Main Branch (ATM_0042)', elevation: '172m MSL' },
    { id: 'mewat', name: 'Mewat Cluster', state: 'Haryana / Rajasthan', lat: 28.0000, lng: 77.0000, atms: 17, complaints: 94, lossAmount: '₹98.5 Lakhs', risk: 'CRITICAL', clusterRadius: '4.1 km', topAtm: 'HDFC Nuh Square (ATM_0112)', elevation: '190m MSL' },
    { id: 'mumbai', name: 'Mumbai Metro', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, atms: 18, complaints: 86, lossAmount: '₹2.10 Cr', risk: 'HIGH', clusterRadius: '2.8 km', topAtm: 'ICICI BKC Complex (ATM_0076)', elevation: '14m MSL' },
    { id: 'bengaluru', name: 'Bengaluru Tech', state: 'Karnataka', lat: 12.9716, lng: 77.5946, atms: 16, complaints: 72, lossAmount: '₹1.15 Cr', risk: 'HIGH', clusterRadius: '3.5 km', topAtm: 'Axis Indiranagar (ATM_0201)', elevation: '920m MSL' },
    { id: 'kolkata', name: 'Kolkata East', state: 'West Bengal', lat: 22.5726, lng: 88.3639, atms: 14, complaints: 64, lossAmount: '₹85.0 Lakhs', risk: 'MEDIUM', clusterRadius: '4.0 km', topAtm: 'Canara Salt Lake (ATM_0311)', elevation: '9m MSL' },
    { id: 'hyderabad', name: 'Cyberabad Hub', state: 'Telangana', lat: 17.3850, lng: 78.4867, atms: 15, complaints: 58, lossAmount: '₹76.2 Lakhs', risk: 'MEDIUM', clusterRadius: '3.9 km', topAtm: 'SBI HITECH City (ATM_0155)', elevation: '542m MSL' },
  ];

  // Dense multi-point incident generator
  const allIncidents = useMemo<IncidentPoint[]>(() => {
    const centers = [
      { id: 'delhi', lat: 28.6139, lng: 77.2090, count: 32, spread: 0.18 },
      { id: 'jamtara', lat: 24.2167, lng: 86.8000, count: 22, spread: 0.22 },
      { id: 'mewat', lat: 28.0000, lng: 77.0000, count: 18, spread: 0.19 },
      { id: 'mumbai', lat: 19.0760, lng: 72.8777, count: 28, spread: 0.15 },
      { id: 'bengaluru', lat: 12.9716, lng: 77.5946, count: 25, spread: 0.14 },
      { id: 'hyderabad', lat: 17.3850, lng: 78.4867, count: 10, spread: 0.14 },
      { id: 'kolkata', lat: 22.5726, lng: 88.3639, count: 15, spread: 0.16 },
    ];

    const categories = ['UPI_FRAUD', 'OTP_SCAM', 'SEXTORTION', 'PHISHING', 'LOAN_APP'];
    const pts: IncidentPoint[] = [];

    let seed = 42;
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
          center: [22.5937, 78.9629],
          zoom: 5,
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

      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // Render Thermal Heatmap Layer
      if (showHeatmap) {
        const renderHeat = () => {
          if ((L as any).heatLayer) {
            const heatData = filteredIncidents.map((p) => [p.lat, p.lng, p.intensity]);
            const heatLayer = (L as any).heatLayer(heatData, {
              radius: heatRadius,
              blur: heatBlur,
              maxZoom: 16,
              max: 1.0,
              gradient: {
                0.2: '#0022ff',
                0.4: '#00e1ff',
                0.6: '#00ff44',
                0.8: '#ffea00',
                1.0: '#ff0000',
              },
            }).addTo(map);
            heatLayerRef.current = heatLayer;
          } else {
            filteredIncidents.forEach((p) => {
              const alpha = Math.min(0.8, p.intensity * 0.7);
              const color = p.intensity > 0.75 ? '#ef4444' : p.intensity > 0.5 ? '#f59e0b' : '#3b82f6';
              const circle = L.circle([p.lat, p.lng], {
                color: 'transparent',
                fillColor: color,
                fillOpacity: alpha,
                radius: 12000 * p.intensity,
              }).addTo(map);
              layersRef.current.push(circle);
            });
          }
        };

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

      // Render DBSCAN rings & floating city markers
      filteredHubs.forEach((hub) => {
        const color = hub.risk === 'CRITICAL' ? '#dc2626' : hub.risk === 'HIGH' ? '#d97706' : '#2563eb';

        if (showHeatCircles) {
          const circle = L.circle([hub.lat, hub.lng], {
            color: color,
            fillColor: color,
            fillOpacity: showHeatmap ? 0 : 0.25,
            weight: 2,
            dashArray: '6, 6',
            radius: hub.risk === 'CRITICAL' ? 40000 : hub.risk === 'HIGH' ? 28000 : 20000,
          }).addTo(map);
          layersRef.current.push(circle);
        }

        if (showAtmLayer) {
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
              <span style="color: #2563eb; font-weight: bold; font-size: 10px;">Target Node: ${hub.topAtm}</span>
            </div>
          `);

          labelMarker.on('click', () => {
            setSelectedHubId(hub.id);
          });

          layersRef.current.push(labelMarker);
        }
      });
    });
  }, [mapStyle, filterRisk, filterCategory, showAtmLayer, showHeatmap, showHeatCircles, heatRadius, heatBlur, filteredHubs, filteredIncidents]);

  const handleSelectHub = (hub: HubDetail) => {
    setSelectedHubId(hub.id);
    if (mapRef.current) {
      mapRef.current.flyTo([hub.lat, hub.lng], 11, { duration: 1.5 });
    }
  };

  const handleResetZoom = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-screen">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            🗺️ Dedicated OpenMapTiles Spatial GIS Studio
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded font-mono font-bold">
              KDE THERMAL ENGINE ACTIVE
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Spatial-Temporal Kernel Density Analytics Across {filteredIncidents.length} Complaint Incidents
          </p>
        </div>

        {/* Style Switches & Layer Toggles */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-300 flex items-center gap-1">
            <button
              onClick={() => setMapStyle('google-roadmap')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                mapStyle === 'google-roadmap' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🗺️ Google Maps
            </button>

            <button
              onClick={() => setMapStyle('google-satellite')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                mapStyle === 'google-satellite' ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🛰️ Satellite
            </button>

            <button
              onClick={() => setMapStyle('google-terrain')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                mapStyle === 'google-terrain' ? 'bg-amber-700 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🏔️ Terrain
            </button>

            <button
              onClick={() => setMapStyle('dark-mode')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                mapStyle === 'dark-mode' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              🌙 Dark Mode
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 shadow-sm"
          >
            🇮🇳 India View
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Controls Sidebar (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 overflow-y-auto">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">GIS Layer Toggles</span>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>🔥 Thermal Gradient Heatmap</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showHeatCircles}
                  onChange={(e) => setShowHeatCircles(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>⭕ DBSCAN Cluster Rings</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showAtmLayer}
                  onChange={(e) => setShowAtmLayer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>📍 Floating City Badges</span>
              </label>
            </div>
          </div>

          {/* Crime Category Filter */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Crime Type Filter</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">ALL CATEGORIES ({allIncidents.length} points)</option>
              <option value="UPI_FRAUD">UPI Payment Fraud</option>
              <option value="OTP_SCAM">OTP / Vishing Scam</option>
              <option value="SEXTORTION">Sextortion / Blackmail</option>
              <option value="PHISHING">Phishing Link / Malicious APK</option>
              <option value="LOAN_APP">Illegal Loan App Extortion</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Active Zone Detail</span>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs font-mono">
              <h4 className="font-extrabold text-slate-900 text-sm">{currentHub.name}</h4>
              <p className="text-slate-500 text-[11px]">{currentHub.state}</p>
              <hr className="border-slate-200" />
              <div className="space-y-1">
                <div>Complaints: <strong className="text-red-600">{currentHub.complaints}</strong></div>
                <div>Financial Loss: <strong className="text-emerald-700">{currentHub.lossAmount}</strong></div>
                <div>Cluster Radius: <strong className="text-blue-700">{currentHub.clusterRadius}</strong></div>
                <div>Top Target ATM: <span className="text-indigo-700 font-bold block mt-0.5">{currentHub.topAtm}</span></div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Quick Hub Navigation</span>
            <div className="space-y-1.5 text-xs font-mono">
              {HUBS.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleSelectHub(h)}
                  className={`w-full text-left p-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                    h.id === selectedHubId ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{h.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">{h.complaints}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Canvas (9 Cols) */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between overflow-hidden">
          <div
            ref={mapContainerRef}
            className="w-full rounded-lg border border-slate-200 overflow-hidden shadow-inner z-10"
            style={{ height: '720px', minHeight: '720px', width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
