import React, { useState } from 'react';
import type { Shelter, SupplyLevel } from '../../types';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { EvacueeIntakeModal } from './EvacueeIntakeModal';
import { SupplyRequisitionModal } from './SupplyRequisitionModal';
import {
  Bed,
  Zap,
  Pill,
  Utensils,
  Droplets,
  CheckCircle,
  Plus,
  Minus,
  UserPlus,
  Send,
  Users,
  HeartPulse,
  Baby
} from 'lucide-react';

interface ShelterCapacityControlProps {
  shelter: Shelter;
  onShelterUpdated: (updated: Shelter) => void;
}

export const ShelterCapacityControl: React.FC<ShelterCapacityControlProps> = ({
  shelter,
  onShelterUpdated
}) => {
  const [availableBeds, setAvailableBeds] = useState(shelter.capacityAvailable);
  const [activeEvacuees, setActiveEvacuees] = useState(shelter.activeEvacueesCount);
  const [supplies, setSupplies] = useState(shelter.suppliesStatus);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);

  const occupancyPercent = Math.min(
    100,
    Math.round(((shelter.capacityTotal - availableBeds) / shelter.capacityTotal) * 100)
  );

  const handleCapacityChange = async (newAvailable: number, newEvacuees: number) => {
    const clampedAvailable = Math.max(0, Math.min(shelter.capacityTotal, newAvailable));
    const clampedEvacuees = Math.max(0, newEvacuees);
    setAvailableBeds(clampedAvailable);
    setActiveEvacuees(clampedEvacuees);

    try {
      const updated = await api.updateShelterCapacity(
        shelter.id || shelter._id!,
        clampedAvailable,
        clampedEvacuees
      );
      onShelterUpdated(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupplyChange = async (key: keyof typeof supplies, value: string) => {
    const newSupplies = { ...supplies, [key]: value };
    setSupplies(newSupplies);

    try {
      const updated = await api.updateShelterSupplies(shelter.id || shelter._id!, newSupplies);
      onShelterUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIntakeConfirmed = (newCount: number) => {
    const newAvailable = Math.max(0, availableBeds - (newCount - activeEvacuees));
    handleCapacityChange(newAvailable, newCount);
  };

  const supplyColor = (val: SupplyLevel) => {
    switch (val) {
      case 'ample':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'critical':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'depleted':
        return 'text-red-400 bg-red-950/60 border-red-500/40';
    }
  };

  // Ward allocations calculation for visual display
  const generalWard = Math.round(activeEvacuees * 0.55);
  const familyWard = Math.round(activeEvacuees * 0.3);
  const medicalWard = Math.max(0, activeEvacuees - generalWard - familyWard);

  return (
    <>
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                SAFE HAVEN FACILITY LOGISTICS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ACTIVE REFUGE
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white mt-0.5">{shelter.name}</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{shelter.address}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => setIsIntakeOpen(true)}
              icon={<UserPlus className="w-3.5 h-3.5" />}
              className="font-mono text-xs"
            >
              Admit Citizen
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRequisitionOpen(true)}
              icon={<Send className="w-3.5 h-3.5" />}
              className="font-mono text-xs border-amber-500/40 text-amber-300 hover:border-amber-400"
            >
              Requisition
            </Button>
          </div>
        </div>

        {/* Capacity & Bed Availability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-400" />
              Live Bed Triage & Occupancy
            </span>
            <span className="font-mono text-xs font-bold text-white">
              {occupancyPercent}% Occupied ({availableBeds} Available / {shelter.capacityTotal} Total)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                occupancyPercent > 85
                  ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                  : occupancyPercent > 65
                  ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>

          {/* Interactive Bed Adjuster Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                AVAILABLE BED SURPLUS
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCapacityChange(availableBeds - 5, activeEvacuees + 5)}
                >
                  <Minus className="w-3 h-3" /> 5
                </Button>
                <span className="text-xl font-bold font-mono text-white min-w-[50px] text-center">
                  {availableBeds}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCapacityChange(availableBeds + 5, activeEvacuees - 5)}
                >
                  <Plus className="w-3 h-3" /> 5
                </Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                ACTIVE REGISTERED EVACUEES
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCapacityChange(availableBeds + 1, activeEvacuees - 1)}
                >
                  -1 Check-out
                </Button>
                <span className="text-xl font-bold font-mono text-cyan-300 min-w-[40px] text-center">
                  {activeEvacuees}
                </span>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleCapacityChange(availableBeds - 1, activeEvacuees + 1)}
                >
                  +1 Check-in
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Ward Allocation Cards */}
        <div>
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
            Internal Facility Ward Allocations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> General Ward
                </span>
                <span className="font-mono text-cyan-400 font-bold">{generalWard} Citizens</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Beds & sleeping cots</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Baby className="w-3.5 h-3.5 text-emerald-400" /> Family Pods
                </span>
                <span className="font-mono text-emerald-400 font-bold">{familyWard} Citizens</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Parents & children sector</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <HeartPulse className="w-3.5 h-3.5 text-red-400" /> Medical Triage
                </span>
                <span className="font-mono text-red-400 font-bold">{medicalWard} Citizens</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Oxygen & clinical nursing</p>
            </div>
          </div>
        </div>

        {/* Supplies Triage Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Essential Resource Telemetry
            </h4>
            {savedSuccess && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Synced Live
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Medical */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Pill className="w-4 h-4 text-red-400" />
                <span>Medical Supplies</span>
              </div>
              <select
                value={supplies.medical}
                onChange={(e) => handleSupplyChange('medical', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold capitalize outline-none ${supplyColor(
                  supplies.medical
                )}`}
              >
                <option value="ample">Ample Stock</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>

            {/* Food */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Food & Rations</span>
              </div>
              <select
                value={supplies.food}
                onChange={(e) => handleSupplyChange('food', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold capitalize outline-none ${supplyColor(
                  supplies.food
                )}`}
              >
                <option value="ample">Ample Stock</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>

            {/* Water */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Potable Water</span>
              </div>
              <select
                value={supplies.water}
                onChange={(e) => handleSupplyChange('water', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold capitalize outline-none ${supplyColor(
                  supplies.water
                )}`}
              >
                <option value="ample">Ample Stock</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>

            {/* Power */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Electrical Power</span>
              </div>
              <select
                value={supplies.power}
                onChange={(e) => handleSupplyChange('power', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-yellow-300 font-bold capitalize outline-none"
              >
                <option value="operational">Grid Operational</option>
                <option value="generator">Backup Generator Active</option>
                <option value="critical">Critical Low Fuel</option>
                <option value="offline">Total Blackout</option>
              </select>
            </div>

            {/* Bedding */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
                <Bed className="w-4 h-4 text-purple-400" />
                <span>Bedding, Cots & Blankets</span>
              </div>
              <select
                value={supplies.bedding}
                onChange={(e) => handleSupplyChange('bedding', e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold capitalize outline-none ${supplyColor(
                  supplies.bedding
                )}`}
              >
                <option value="ample">Ample Supply</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical Shortage</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Evacuee Intake Modal */}
      <EvacueeIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        shelter={shelter}
        onIntakeRegistered={handleIntakeConfirmed}
      />

      {/* Supply Requisition Modal */}
      <SupplyRequisitionModal
        isOpen={isRequisitionOpen}
        onClose={() => setIsRequisitionOpen(false)}
        shelter={shelter}
      />
    </>
  );
};
