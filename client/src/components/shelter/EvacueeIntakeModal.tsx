import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Shelter } from '../../types';
import { UserPlus, CheckCircle } from 'lucide-react';

interface EvacueeIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelter: Shelter;
  onIntakeRegistered: (newCount: number) => void;
}

export const EvacueeIntakeModal: React.FC<EvacueeIntakeModalProps> = ({
  isOpen,
  onClose,
  shelter,
  onIntakeRegistered
}) => {
  const [name, setName] = useState('');
  const [familySize, setFamilySize] = useState(1);
  const [medicalNeeds, setMedicalNeeds] = useState('none');
  const [specialAssistance, setSpecialAssistance] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setRegistered(true);
    setTimeout(() => {
      onIntakeRegistered(shelter.activeEvacueesCount + familySize);
      setRegistered(false);
      setName('');
      setFamilySize(1);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EVACUEE INTAKE & MANIFEST REGISTRATION"
      subtitle={`Register arriving citizens into ${shelter.name}`}
      maxWidth="md"
    >
      {registered ? (
        <div className="py-8 text-center text-emerald-400 font-mono">
          <CheckCircle className="w-14 h-14 mx-auto mb-3 text-emerald-400 animate-bounce" />
          <h4 className="text-lg font-bold text-white font-display">Citizen Manifest Registered</h4>
          <p className="text-xs text-slate-300 mt-1">
            {name} (+{familySize - 1} dependents) admitted. Bed reservation updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Primary Evacuee Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Elena Rostova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Family / Group Size
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={familySize}
                onChange={(e) => setFamilySize(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Medical Triage Status
              </label>
              <select
                value={medicalNeeds}
                onChange={(e) => setMedicalNeeds(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm outline-none"
              >
                <option value="none">No Urgent Medical Needs</option>
                <option value="minor">Minor Cuts / Dehydration</option>
                <option value="chronic">Requires Insulin / Oxygen</option>
                <option value="urgent">Urgent Trauma Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Special Assistance / Dietary / Mobility
            </label>
            <input
              type="text"
              placeholder="e.g. Wheelchair access needed, infant formula required"
              value={specialAssistance}
              onChange={(e) => setSpecialAssistance(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="md"
              type="submit"
              icon={<UserPlus className="w-4 h-4" />}
              className="font-mono text-xs"
            >
              REGISTER ADMISSION
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
