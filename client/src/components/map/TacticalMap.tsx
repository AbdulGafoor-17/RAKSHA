import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { Report, Shelter, RouteData } from '../../types';
import {
  Layers,
  Crosshair,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  AlertTriangle
} from 'lucide-react';

interface TacticalMapProps {
  reports: Report[];
  shelters: Shelter[];
  userLocation?: [number, number]; // [lng, lat]
  activeRoute?: RouteData | null;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectHazard?: (hazard: Report) => void;
  onMapClick?: (coords: [number, number]) => void;
  isReportingMode?: boolean;
  highlightHazardId?: string;
  showHeatmap?: boolean;
}

type MapTheme = 'dark' | 'satellite' | 'street';

const TILE_SERVERS: Record<MapTheme, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
    maxZoom: 19
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics',
    maxZoom: 19
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
};

function getHazardSvgIcon(category: string, severity: string) {
  const isCritical = severity === 'critical';
  const isHigh = severity === 'high';

  let iconSvg = '';
  let color = '#38bdf8';
  let bgColor = 'rgba(56, 189, 248, 0.15)';
  let borderColor = '#38bdf8';

  if (isCritical) {
    color = '#ef4444';
    bgColor = 'rgba(239, 68, 68, 0.25)';
    borderColor = '#ef4444';
  } else if (isHigh) {
    color = '#f97316';
    bgColor = 'rgba(249, 115, 22, 0.2)';
    borderColor = '#f97316';
  } else {
    color = '#f59e0b';
    bgColor = 'rgba(245, 158, 11, 0.18)';
    borderColor = '#f59e0b';
  }

  switch (category) {
    case 'flood':
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
      break;
    case 'fire':
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
      break;
    case 'road_blocked':
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;
      break;
    case 'structural_collapse':
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>`;
      break;
    case 'gas_leak':
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
      break;
    default:
      iconSvg = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  return { iconSvg, color, bgColor, borderColor, isCritical };
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  reports,
  shelters,
  userLocation,
  activeRoute,
  onSelectShelter,
  onSelectHazard,
  onMapClick,
  isReportingMode = false,
  highlightHazardId,
  showHeatmap = false
}) => {
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<MapTheme>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);

  // Layer Visibility Filters
  const [layerVisibility, setLayerVisibility] = useState({
    hazards: true,
    shelters: true,
    perimeters: true,
    route: true
  });

  const layersRef = useRef<{
    hazards: L.LayerGroup;
    perimeters: L.LayerGroup;
    shelters: L.LayerGroup;
    route: L.LayerGroup;
    user: L.LayerGroup;
    heatmap: L.LayerGroup;
  }>({
    hazards: L.layerGroup(),
    perimeters: L.layerGroup(),
    shelters: L.layerGroup(),
    route: L.layerGroup(),
    user: L.layerGroup(),
    heatmap: L.layerGroup()
  });

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const defaultLat = userLocation ? userLocation[1] : 37.7749;
    const defaultLng = userLocation ? userLocation[0] : -122.4194;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    const initialTiles = L.tileLayer(TILE_SERVERS.dark.url, {
      maxZoom: TILE_SERVERS.dark.maxZoom,
      subdomains: 'abcd'
    }).addTo(map);

    currentTileLayerRef.current = initialTiles;

    layersRef.current.heatmap.addTo(map);
    layersRef.current.perimeters.addTo(map);
    layersRef.current.hazards.addTo(map);
    layersRef.current.shelters.addTo(map);
    layersRef.current.route.addTo(map);
    layersRef.current.user.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when Theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const cfg = TILE_SERVERS[mapTheme];
    const newTiles = L.tileLayer(cfg.url, {
      maxZoom: cfg.maxZoom,
      subdomains: 'abcd'
    }).addTo(map);

    currentTileLayerRef.current = newTiles;
  }, [mapTheme]);

  // Handle Map Clicks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick([e.latlng.lng, e.latlng.lat]);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick]);

  // Recenter on Citizen GPS
  const handleLocateCitizen = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;
    map.flyTo([userLocation[1], userLocation[0]], 15, { duration: 1.2 });
  }, [userLocation]);

  // Fit all elements in view
  const handleFitAll = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allPoints: L.LatLngExpression[] = [];
    if (userLocation) allPoints.push([userLocation[1], userLocation[0]]);
    shelters.forEach((s) => allPoints.push([s.location.coordinates[1], s.location.coordinates[0]]));
    reports.forEach((r) => allPoints.push([r.location.coordinates[1], r.location.coordinates[0]]));

    if (allPoints.length > 0) {
      map.flyToBounds(L.latLngBounds(allPoints), { padding: [40, 40], duration: 1.2 });
    }
  }, [userLocation, shelters, reports]);

  // Toggle Fullscreen on Container
  const toggleFullscreen = () => {
    if (!containerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      containerWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Zoom helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // 2. Render User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.user.clearLayers();

    if (userLocation) {
      const [lng, lat] = userLocation;

      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <div class="absolute w-10 h-10 rounded-full bg-cyan-500/25 animate-ping"></div>
            <div class="absolute w-7 h-7 rounded-full bg-cyan-500/40 border border-cyan-400"></div>
            <div class="relative w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([lat, lng], { icon: userIcon });
      marker.bindPopup(`
        <div class="font-sans text-xs min-w-[190px]">
          <div class="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 mb-2">
            <span class="font-bold text-cyan-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              YOUR GPS LOCATION
            </span>
          </div>
          <div class="text-slate-200 font-mono text-[11px] mb-1">
            Lat: ${lat.toFixed(4)}° N, Lng: ${lng.toFixed(4)}° W
          </div>
          <div class="text-[10px] text-slate-400 font-sans">
            Active Evacuation Telemetry Online • Live Intercept Scanner Armed
          </div>
        </div>
      `);
      layersRef.current.user.addLayer(marker);
    }
  }, [userLocation]);

  // 3. Render Shelters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.shelters.clearLayers();

    if (!layerVisibility.shelters) return;

    shelters.forEach((shelter) => {
      const [lng, lat] = shelter.location.coordinates;
      const isLowCapacity = shelter.capacityAvailable < 50;

      const shelterIcon = L.divIcon({
        className: 'shelter-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-xl bg-[#0d131f]/95 border-2 ${
              isLowCapacity ? 'border-amber-400 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            } flex items-center justify-center transition-all duration-300 group-hover:scale-115">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="absolute -top-2 -right-2 bg-emerald-500 text-black text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full shadow-md border border-white/40">
              ${shelter.capacityAvailable}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lat, lng], { icon: shelterIcon });

      const popupHtml = `
        <div class="font-sans text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
            <span class="font-bold text-emerald-400 font-display text-sm">${shelter.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              ${shelter.capacityAvailable > 0 ? 'OPEN SAFE HAVEN' : 'FULL'}
            </span>
          </div>
          <p class="text-slate-300 mb-2 font-sans text-xs">${shelter.address}</p>
          <div class="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 mb-3 font-mono">
            <div>
              <span class="text-[10px] text-slate-400 block">OPEN BEDS</span>
              <span class="font-bold text-white text-sm">${shelter.capacityAvailable} / ${shelter.capacityTotal}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">POWER GRID</span>
              <span class="font-bold text-white capitalize text-sm">${shelter.suppliesStatus?.power || 'Operational'}</span>
            </div>
          </div>
          <button id="evac-btn-${shelter.id || shelter._id}" class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold font-mono text-xs shadow-md transition-all cursor-pointer text-center block border border-emerald-400/40">
            ⚡ ROUTE EVACUATION HERE
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`evac-btn-${shelter.id || shelter._id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectShelter) onSelectShelter(shelter);
            map.closePopup();
          };
        }
      });

      marker.on('click', () => {
        if (onSelectShelter) onSelectShelter(shelter);
      });

      layersRef.current.shelters.addLayer(marker);
    });
  }, [shelters, layerVisibility.shelters, onSelectShelter]);

  // 4. Render Hazards, Impact Perimeters & Heatmap
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.hazards.clearLayers();
    layersRef.current.perimeters.clearLayers();
    layersRef.current.heatmap.clearLayers();

    if (!layerVisibility.hazards) return;

    reports.forEach((report) => {
      const [lng, lat] = report.location.coordinates;
      const isHazard = report.type === 'hazard';
      const radiusMeters = report.impactRadiusMeters || 160;

      const { iconSvg, color, bgColor, borderColor, isCritical } = getHazardSvgIcon(
        report.hazardCategory,
        report.severity
      );

      // 1. Draw Impact Radius Danger Circle
      if (isHazard && report.status !== 'resolved' && layerVisibility.perimeters) {
        const circle = L.circle([lat, lng], {
          radius: radiusMeters,
          color: borderColor,
          fillColor: color,
          fillOpacity: 0.14,
          weight: isCritical ? 2.5 : 1.5,
          dashArray: isCritical ? '6, 6' : undefined
        });
        layersRef.current.perimeters.addLayer(circle);

        if (showHeatmap) {
          const heatCircle = L.circle([lat, lng], {
            radius: radiusMeters * 2,
            color: 'transparent',
            fillColor: color,
            fillOpacity: 0.25
          });
          layersRef.current.heatmap.addLayer(heatCircle);
        }
      }

      // 2. Icon Marker with tactical SVG
      const hazardIcon = L.divIcon({
        className: 'tactical-hazard-marker',
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            ${isCritical ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-60" style="background-color: ${color}"></div>` : ''}
            <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125 border"
                 style="background-color: ${bgColor}; border-color: ${borderColor}; box-shadow: 0 0 16px ${color}55;">
              ${iconSvg}
            </div>
            <div class="absolute -bottom-1 font-mono text-[9px] font-bold px-1 rounded uppercase tracking-wider text-white" style="background-color: ${borderColor};">
              ${report.severity.substring(0, 4)}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lat, lng], { icon: hazardIcon });

      const popupHtml = `
        <div class="font-sans text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
            <span class="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded" style="background: ${color}25; color: ${color}; border: 1px solid ${color}40">
              ${report.severity.toUpperCase()} • ${report.type.toUpperCase()}
            </span>
            <span class="text-slate-400 text-[10px] font-mono capitalize">${report.status}</span>
          </div>
          <h4 class="font-bold text-white text-sm mb-1 font-display">${report.title}</h4>
          <p class="text-slate-300 text-xs mb-2 leading-relaxed font-sans">${report.description}</p>
          <div class="text-[10px] text-slate-400 font-mono space-y-0.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div>📍 ${report.address}</div>
            <div>⚡ Impact Zone: ${radiusMeters}m perimeter</div>
            <div>⏱️ Logged: ${new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectHazard) onSelectHazard(report);
      });

      layersRef.current.hazards.addLayer(marker);
    });
  }, [reports, showHeatmap, layerVisibility.hazards, layerVisibility.perimeters, onSelectHazard]);

  // Pan to highlighted hazard
  useEffect(() => {
    if (!highlightHazardId || !mapInstanceRef.current) return;
    const target = reports.find((r) => (r.id || r._id) === highlightHazardId);
    if (target && target.location?.coordinates) {
      const [lng, lat] = target.location.coordinates;
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }, [highlightHazardId, reports]);

  // 5. Render Evacuation Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.route.clearLayers();

    if (!layerVisibility.route) return;

    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const latLngs: L.LatLngExpression[] = activeRoute.coordinates.map(([lng, lat]) => [lat, lng]);

      const isRerouted = activeRoute.rerouted;
      const isObstructed = activeRoute.isObstructed;

      // Outer glow line
      const glowPolyline = L.polyline(latLngs, {
        color: isObstructed ? '#ef4444' : isRerouted ? '#10b981' : '#06b6d4',
        weight: 9,
        opacity: 0.28,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // Sharp central route line
      const mainPolyline = L.polyline(latLngs, {
        color: isObstructed ? '#f87171' : isRerouted ? '#34d399' : '#38bdf8',
        weight: 4.5,
        opacity: 0.95,
        dashArray: isObstructed ? '8, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round'
      });

      layersRef.current.route.addLayer(glowPolyline);
      layersRef.current.route.addLayer(mainPolyline);

      // Fit route with smooth camera animation
      const bounds = mainPolyline.getBounds();
      map.flyToBounds(bounds, { padding: [55, 55], duration: 1.2 });
    }
  }, [activeRoute, layerVisibility.route]);

  return (
    <div
      ref={containerWrapperRef}
      className={`relative w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      {/* Leaflet Mount Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px]" />

      {/* Top Left: Mission HUD & Mode Banner */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex flex-col gap-2 max-w-[280px] sm:max-w-none">
        <div className="bg-[#070a10]/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold block leading-tight">
              TACTICAL RADAR HUD
            </span>
            <span className="text-[9px] font-mono text-slate-400 block">
              OSM & GIS INTERSECTION SCANNER ACTIVE
            </span>
          </div>
        </div>

        {isReportingMode && (
          <div className="bg-red-600/95 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl shadow-2xl animate-pulse border border-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CLICK MAP TO PIN HAZARD OBSTACLE</span>
          </div>
        )}
      </div>

      {/* Top Right: Theme Switcher & Map Controls Toolbar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Map Theme Toggle (Dark / Satellite / Street) */}
        <div className="bg-[#070a10]/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1">
          <button
            onClick={() => setMapTheme('dark')}
            title="Dark Matter Tactical View"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
              mapTheme === 'dark'
                ? 'bg-blue-600/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tactical
          </button>
          <button
            onClick={() => setMapTheme('satellite')}
            title="High-Res Satellite Recon View"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
              mapTheme === 'satellite'
                ? 'bg-blue-600/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTheme('street')}
            title="Street & Terrain View"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
              mapTheme === 'street'
                ? 'bg-blue-600/80 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Layers Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            title="Toggle Map Data Layers"
            className={`p-2 rounded-xl bg-[#070a10]/90 border shadow-xl backdrop-blur-md text-slate-300 hover:text-white transition-all ${
              layersOpen ? 'border-cyan-500 text-cyan-300' : 'border-slate-700/80'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {layersOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0d131f]/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-xl z-30 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold border-b border-slate-800 pb-1">
                OVERLAY TELEMETRY
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.hazards}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, hazards: e.target.checked })}
                  className="rounded text-red-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Active Hazards</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.shelters}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, shelters: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Safe Havens</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.perimeters}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, perimeters: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Danger Perimeters</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.route}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, route: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span>Evacuation Route</span>
              </label>
            </div>
          )}
        </div>

        {/* Locate Me */}
        <button
          onClick={handleLocateCitizen}
          title="Center on Citizen GPS"
          className="p-2 rounded-xl bg-[#070a10]/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Fit All */}
        <button
          onClick={handleFitAll}
          title="Fit All Facilities and Hazards"
          className="p-2 rounded-xl bg-[#070a10]/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300 hover:text-white transition-colors"
        >
          <MapPin className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen Map"
          className="p-2 rounded-xl bg-[#070a10]/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Right Bottom Zoom Controls */}
      <div className="absolute bottom-16 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-xl bg-[#070a10]/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-xl bg-[#070a10]/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left Legend & Status Bar */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 bg-[#070a10]/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
          <span>Citizen GPS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
          <span>Safe Haven</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
          <span>Hazard Obstacle</span>
        </div>
        {activeRoute && (
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
            <span className="w-3.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]"></span>
            <span>Detour Corridor</span>
          </div>
        )}
      </div>
    </div>
  );
};
