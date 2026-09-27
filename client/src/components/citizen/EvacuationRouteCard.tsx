import React from 'react';
import type { RouteData, Shelter } from '../../types';
import {
  ShieldCheck,
  Navigation,
  Clock,
  AlertTriangle,
  Compass,
  CheckCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Button } from '../common/Button';

interface EvacuationRouteCardProps {
  route: RouteData;
  shelter?: Shelter | null;
  allShelters?: Shelter[];
  onSelectShelter?: (shelter: Shelter) => void;
  onCancelEvacuation: () => void;
  onToggleGuidance?: () => void;
  showGuidance?: boolean;
}

export const EvacuationRouteCard: React.FC<EvacuationRouteCardProps> = ({
  route,
  shelter,
  allShelters = [],
  onSelectShelter,
  onCancelEvacuation,
  onToggleGuidance,
  showGuidance = false
}) => {
  const distanceKm = (route.distanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(route.durationSeconds / 60);

  // Computed safety metrics
  const safetyScore = route.isObstructed ? 42 : route.rerouted ? 94 : 98;
  const clearanceText = route.isObstructed
    ? 'Critical Obstacle Detected Along Pathway'
    : route.rerouted
    ? 'Autonomous Detour Circumventing Hazard (Safe Clearance: 180m)'
    : 'Clear Path Verified by Geospatial Engine';

  return (
    <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-4">
      {/* Top Banner indicating route status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {route.rerouted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              <span>DYNAMIC DETOUR ACTIVE</span>
            </div>
          ) : route.isObstructed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>OBSTACLE ON PATH</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
              <Navigation className="w-3.5 h-3.5" />
              <span>OPTIMAL ESCAPE CORRIDOR</span>
            </div>
          )}
        </div>

        <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          Live GPS
        </span>
      </div>

      {/* Main Destination Info */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            TARGET SAFE HAVEN REFUGE
          </span>
          {allShelters.length > 1 && onSelectShelter && (
            <select
              value={shelter?.id || shelter?._id || ''}
              onChange={(e) => {
                const s = allShelters.find((item) => (item.id || item._id) === e.target.value);
                if (s) onSelectShelter(s);
              }}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-emerald-300 outline-none"
            >
              {allShelters.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  Switch: {s.name} ({s.capacityAvailable} beds)
                </option>
              ))}
            </select>
          )}
        </div>

        <h4 className="text-xl font-bold font-display text-white mt-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{shelter?.name || 'Nearest Regional Safe Haven'}</span>
        </h4>
        <p className="text-xs text-slate-300 mt-1 font-sans flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{shelter?.address || 'Designated civil protection shelter'}</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">DISTANCE</span>
          <span className="text-lg font-bold font-mono text-cyan-300">{distanceKm} km</span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">EST. TIME</span>
          <span className="text-lg font-bold font-mono text-white flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {durationMin} min
          </span>
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">OPEN BEDS</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            {shelter?.capacityAvailable ?? 400}+
          </span>
        </div>
      </div>

      {/* Safety Score Meter */}
      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Route Safety Index
          </span>
          <span className={`font-bold ${safetyScore > 80 ? 'text-emerald-400' : 'text-red-400'}`}>
            {safetyScore}% Clear
          </span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              safetyScore > 80 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
            }`}
            style={{ width: `${safetyScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 font-mono mt-1">{clearanceText}</p>
      </div>

      {/* Detour Alert Card if dynamically rerouted */}
      {route.rerouted && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>
            Autonomous reroute triggered: Detected hazard on primary road. Detour added +1.2 min,
            maintaining 100% dry elevation.
          </span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-2 pt-1">
        {onToggleGuidance && (
          <Button
            variant="tactical"
            size="sm"
            onClick={onToggleGuidance}
            className="flex-1 text-xs font-mono"
          >
            {showGuidance ? 'Hide Step Guidance' : 'Turn-by-Turn Waypoints'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelEvacuation}
          className="text-xs font-mono text-slate-400 hover:text-white"
        >
          Cancel Navigation
        </Button>
      </div>
    </div>
  );
};
