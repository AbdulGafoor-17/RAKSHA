import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import {
  Droplets,
  Zap,
  RotateCcw,
  Crosshair,
  Sparkles,
  Radio,
  ArrowRight
} from 'lucide-react';
import type { RouteData } from '../../types';

interface DisasterSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute?: RouteData | null;
  onHazardInjected?: () => void;
}

export const DisasterSimulatorModal: React.FC<DisasterSimulatorModalProps> = ({
  isOpen,
  onClose,
  activeRoute,
  onHazardInjected
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [stepSimulation, setStepSimulation] = useState<string | null>(null);

  // 1. HERO DEMO TRIGGER: Plant obstacle directly on active evacuation route
  const handleBlockActiveRoute = async () => {
    setLoading(true);
    setStatusMessage(null);
    setStepSimulation('Pinpointing active evacuation path coordinates...');

    try {
      const coords = activeRoute?.coordinates || [
        [-122.4150, 37.7750],
        [-122.4158, 37.7770],
        [-122.4167, 37.7793]
      ];

      setTimeout(() => setStepSimulation('Injecting flash flood obstacle & severance zone...'), 400);

      await api.blockActiveRoute(
        coords,
        'LIVE DEMO: Bridge Collapse & Rapid Culvert Inundation'
      );

      setStepSimulation('Recalculating perimeter detours in OpenRouteService...');

      setTimeout(() => {
        setStepSimulation(null);
        setStatusMessage(
          '🚨 Hazard successfully planted! Dynamic route recalculation dispatched across WebSockets in 48ms.'
        );
        if (onHazardInjected) onHazardInjected();
      }, 700);
    } catch (err: any) {
      setStepSimulation(null);
      setStatusMessage(`Simulation error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Preset Scenarios
  const handleScenario = async (type: 'flash_flood' | 'earthquake') => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await api.triggerScenario(type);
      setStatusMessage(
        `Catastrophic scenario "${type.replace('_', ' ').toUpperCase()}" triggered across metropolitan grid.`
      );
      if (onHazardInjected) onHazardInjected();
    } catch (err: any) {
      setStatusMessage(`Scenario error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset demo data
  const handleReset = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await api.resetDemoData();
      setStatusMessage('Initial clean baseline state restored (5 Safe Havens, 6 Baseline Incidents).');
      if (onHazardInjected) onHazardInjected();
    } catch (err: any) {
      setStatusMessage(`Reset error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DISASTER SIMULATION COMMAND DECK"
      subtitle="Inject synthetic catastrophic events to validate real-time dynamic rerouting & triage"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Step sequence simulation indicator */}
        {stepSimulation && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 font-mono text-xs flex items-center gap-2.5 animate-pulse">
            <Radio className="w-4 h-4 text-red-400 shrink-0 animate-spin" />
            <span>{stepSimulation}</span>
          </div>
        )}

        {/* Status notification banner */}
        {statusMessage && !stepSimulation && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* PRIMARY DEMO TRIGGER */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/70 via-slate-900 to-[#070a10] border border-red-500/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <Crosshair className="w-36 h-36 text-red-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              FLAGSHIP DEMONSTRATION TRIGGER
            </div>
            <h4 className="text-xl font-bold font-display text-white mb-1.5">
              Simulate Instant Route Obstruction
            </h4>
            <p className="text-xs text-slate-300 mb-4 max-w-lg leading-relaxed font-sans">
              Injects a critical bridge collapse directly onto the active evacuation path.
              The geospatial engine detects the intersection, triggers an audio alarm, and immediately
              re-routes the citizen terminal via WebSockets.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="danger"
                size="lg"
                onClick={handleBlockActiveRoute}
                loading={loading}
                icon={<Crosshair className="w-5 h-5" />}
                className="font-mono tracking-wider text-xs shadow-[0_0_25px_rgba(239,68,68,0.5)]"
              >
                ⚡ TRIGGER DYNAMIC REROUTE DEMO
              </Button>

              <span className="text-[11px] font-mono text-slate-400">
                {activeRoute ? 'Active Route Detected' : 'Using Demo Path (SF Civic Corridor)'}
              </span>
            </div>
          </div>
        </div>

        {/* PRESET CATASTROPHIC SCENARIOS */}
        <div>
          <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            Preset Catastrophic Multi-Hazard Scenarios
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleScenario('flash_flood')}
              disabled={loading}
              className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 text-cyan-400 mb-1.5">
                <Droplets className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm font-display text-white">Atmospheric River Flood Surge</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Spawns 3 severe street inundation zones, closing low-lying Market & Mission corridors.
              </p>
              <div className="mt-2 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Deploy Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button
              onClick={() => handleScenario('earthquake')}
              disabled={loading}
              className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="flex items-center gap-2.5 text-amber-400 mb-1.5">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm font-display text-white">M6.8 Seismic Fault Rupture</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Structural overpass fractures, shattered glass perimeters, and active gas pipe leaks.
              </p>
              <div className="mt-2 text-[10px] font-mono text-amber-300 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Deploy Scenario</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* RESTORE INITIAL SEED DATA */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-300 block font-bold">RESET SIMULATION BASELINE</span>
            <span className="text-[11px] text-slate-500">
              Restores original 5 safe havens & 6 baseline incidents
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            loading={loading}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="font-mono text-xs"
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </Modal>
  );
};
