import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { getSocket } from '../../services/socket';
import { Radio, AlertTriangle } from 'lucide-react';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [transmitted, setTransmitted] = useState(false);

  const presets = [
    {
      title: 'MANDATORY EVACUATION ORDER: COASTAL SECTOR',
      message: 'Storm surge inundation projected to breach seawall in 40 minutes. Move immediately to high ground shelters.'
    },
    {
      title: 'SHELTER IN PLACE: CHEMICAL VAPOR PLUME',
      message: 'Toxic smoke moving northeast across SoMa corridor. Seal ventilation ducts and remain indoors until cleared.'
    }
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const socket = getSocket();
    socket.emit('emergency:broadcast', {
      title,
      message,
      severity,
      timestamp: new Date()
    });

    setTransmitted(true);
    setTimeout(() => {
      setTransmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ISSUE EMERGENCY METROPOLITAN BROADCAST"
      subtitle="Overrides citizen terminals with high-priority audio alarm and tactical alert banner"
      maxWidth="lg"
    >
      {transmitted ? (
        <div className="py-8 text-center text-emerald-400 font-mono">
          <Radio className="w-12 h-12 mx-auto mb-3 animate-ping" />
          <h4 className="text-lg font-bold text-white font-display">Broadcast Transmitted Across Grid</h4>
          <p className="text-xs text-slate-400 mt-1">All citizen terminals and mobile nodes notified.</p>
        </div>
      ) : (
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-slate-400 block uppercase">Quick Presets</span>
            <div className="flex flex-col gap-1.5">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setTitle(p.title);
                    setMessage(p.message);
                  }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:border-red-500/40 transition-colors"
                >
                  <span className="font-bold font-mono text-red-400 block">{p.title}</span>
                  <span className="text-slate-400 line-clamp-1">{p.message}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Broadcast Alert Header
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FLASH FLOOD RED ALERT: MANDATORY EVACUATION"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Threat Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-red-400 font-mono text-xs outline-none"
              >
                <option value="critical">Critical (Red Alert)</option>
                <option value="high">High (Evacuate)</option>
                <option value="medium">Medium (Advisory)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Civil Protection Instructions
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explicit citizen safety instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              type="submit"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              TRANSMIT LIVE ALARM
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
