import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Shelter } from '../../types';
import { Send, CheckCircle, Droplets, Utensils, Pill, Zap } from 'lucide-react';

interface SupplyRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelter: Shelter;
}

export const SupplyRequisitionModal: React.FC<SupplyRequisitionModalProps> = ({
  isOpen,
  onClose,
  shelter
}) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    water: true,
    medical: false,
    food: false,
    power: false
  });
  const [urgency, setUrgency] = useState<'critical' | 'high' | 'routine'>('high');
  const [notes, setNotes] = useState('Require 500L potable water replenishment before next surge.');
  const [sent, setSent] = useState(false);

  const toggleItem = (k: string) => {
    setSelectedItems((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EMERGENCY SUPPLY LOGISTICS REQUISITION"
      subtitle={`Dispatch high-priority resupply request for ${shelter.name}`}
      maxWidth="md"
    >
      {sent ? (
        <div className="py-8 text-center text-emerald-400 font-mono">
          <CheckCircle className="w-14 h-14 mx-auto mb-3 text-emerald-400 animate-bounce" />
          <h4 className="text-lg font-bold text-white font-display">Requisition Transmitted to Command</h4>
          <p className="text-xs text-slate-300 mt-1">
            Logistics convoy queued at Central Regional Depot.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Required Emergency Resources
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => toggleItem('water')}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  selectedItems.water
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Potable Water (Bulk)</span>
              </button>

              <button
                type="button"
                onClick={() => toggleItem('food')}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  selectedItems.food
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>MRE Rations / Meals</span>
              </button>

              <button
                type="button"
                onClick={() => toggleItem('medical')}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  selectedItems.medical
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Pill className="w-4 h-4 text-red-400" />
                <span>Trauma Supplies</span>
              </button>

              <button
                type="button"
                onClick={() => toggleItem('power')}
                className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                  selectedItems.power
                    ? 'bg-yellow-950/80 border-yellow-500 text-yellow-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Generator Diesel Fuel</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Priority Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none"
            >
              <option value="critical">Critical (Immediate Depletion Risk)</option>
              <option value="high">High (Needed within 3 hours)</option>
              <option value="routine">Routine (Next scheduled depot run)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Dispatch Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={<Send className="w-4 h-4" />}
              className="font-mono text-xs"
            >
              TRANSMIT REQUISITION
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
