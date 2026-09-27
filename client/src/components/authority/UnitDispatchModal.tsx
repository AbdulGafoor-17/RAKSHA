import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Report } from '../../types';
import { Truck, Radio } from 'lucide-react';

interface UnitDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onDispatchConfirmed: (reportId: string, unitName: string, notes: string) => void;
}

export const UnitDispatchModal: React.FC<UnitDispatchModalProps> = ({
  isOpen,
  onClose,
  report,
  onDispatchConfirmed
}) => {
  const [selectedUnit, setSelectedUnit] = useState('Engine 14 (Rapid Water Rescue)');
  const [priority, setPriority] = useState<'alpha' | 'bravo' | 'charlie'>('alpha');
  const [dispatchNotes, setDispatchNotes] = useState('Deploy amphibious raft and perimeter barrier.');
  const [dispatched, setDispatched] = useState(false);

  if (!report) return null;

  const units = [
    { name: 'Engine 14 (Rapid Water Rescue)', type: 'Flood / Water', eta: '4 min', status: 'Ready' },
    { name: 'USAR Heavy Task Force 3', type: 'Debris / Collapse', eta: '7 min', status: 'Ready' },
    { name: 'Medical Triage Unit Bravo 2', type: 'Casualty / Paramedic', eta: '5 min', status: 'Ready' },
    { name: 'Hazmat Recon Unit 9', type: 'Chemical / Gas', eta: '9 min', status: 'Standby' },
    { name: 'National Guard Transport Alpha', type: 'Heavy Evac', eta: '12 min', status: 'Ready' }
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatched(true);
    setTimeout(() => {
      onDispatchConfirmed(report.id || report._id!, selectedUnit, dispatchNotes);
      setDispatched(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DISPATCH EMERGENCY RESPONSE SQUAD"
      subtitle={`Assign tactical unit to incident: ${report.title}`}
      maxWidth="lg"
    >
      {dispatched ? (
        <div className="py-8 text-center text-emerald-400 font-mono">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/40 animate-ping">
            <Radio className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-lg font-bold text-white font-display">Unit Dispatched Over Tactical Net</h4>
          <p className="text-xs text-slate-300 mt-1">
            {selectedUnit} en route to {report.address}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Incident target banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">TARGET INCIDENT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-red-950 text-red-400 border border-red-500/40">
                {report.severity} Severity
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-display">{report.title}</h4>
            <p className="text-xs text-slate-400 font-sans">{report.address}</p>
          </div>

          {/* Unit Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Response Unit
            </label>
            <div className="space-y-2">
              {units.map((unit, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedUnit(unit.name)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                    selectedUnit === unit.name
                      ? 'bg-blue-950/80 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className={`w-4 h-4 ${selectedUnit === unit.name ? 'text-blue-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-white block">{unit.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{unit.type}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    <span className="text-emerald-400 font-bold block">ETA: {unit.eta}</span>
                    <span className="text-slate-500 uppercase">{unit.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Dispatch Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('alpha')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                  priority === 'alpha'
                    ? 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ALPHA (Lights & Sirens)
              </button>
              <button
                type="button"
                onClick={() => setPriority('bravo')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                  priority === 'bravo'
                    ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                BRAVO (Urgent)
              </button>
              <button
                type="button"
                onClick={() => setPriority('charlie')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                  priority === 'charlie'
                    ? 'bg-blue-950/90 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                CHARLIE (Standard)
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Tactical Instructions & Equipment Mandate
            </label>
            <input
              type="text"
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={<Truck className="w-4 h-4" />}
              className="font-mono text-xs"
            >
              CONFIRM DISPATCH UNIT
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
