import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Phone, PhoneCall, Copy, Check, ShieldAlert, HeartPulse, LifeBuoy, AlertCircle } from 'lucide-react';

interface EmergencyHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const hotlines = [
    {
      title: 'Metropolitan Emergency Police & Fire (911)',
      number: '911',
      description: 'Immediate life threats, fire outbursts, active structural collapse & medical emergencies.',
      category: 'Immediate Emergency',
      icon: <PhoneCall className="w-5 h-5 text-red-400" />,
      color: 'border-red-500/50 bg-red-950/40 text-red-300'
    },
    {
      title: 'FEMA Disaster Assistance Coordination',
      number: '1-800-621-3362',
      description: 'Federal emergency shelter aid, disaster relief registration, displacement support.',
      category: 'Disaster Relief',
      icon: <ShieldAlert className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/50 bg-blue-950/40 text-blue-300'
    },
    {
      title: 'Disaster Distress & Crisis Helpline',
      number: '1-800-985-5990',
      description: '24/7 multilingual crisis counseling, trauma intervention, emotional stress relief.',
      category: 'Crisis Counseling',
      icon: <HeartPulse className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/50 bg-purple-950/40 text-purple-300'
    },
    {
      title: 'American Red Cross Regional Command',
      number: '1-800-733-2767',
      description: 'Emergency shelter logistics, missing family reunification, emergency supply kits.',
      category: 'Shelter & Supplies',
      icon: <LifeBuoy className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
    },
    {
      title: 'National Toxic Hazmat & Poison Control',
      number: '1-800-222-1222',
      description: 'Chemical plume exposure, toxic vapor inhalation, contaminated flood water guidance.',
      category: 'Chemical / Toxic',
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 bg-amber-950/40 text-amber-300'
    }
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EMERGENCY CRISIS HOTLINES & PROTOCOLS"
      subtitle="Direct communications channels for metropolitan civil defense, search & rescue, and relief"
      maxWidth="lg"
    >
      <div className="space-y-3">
        {hotlines.map((h, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-2xl border ${h.color} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 shrink-0">
                {h.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm font-display">{h.title}</h4>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                    {h.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-sans leading-relaxed">
                  {h.description}
                </p>
                <span className="text-sm font-mono font-bold text-white mt-1 block">
                  {h.number}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleCopy(h.number)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-mono"
                title="Copy phone number"
              >
                {copiedNumber === h.number ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <a
                href={`tel:${h.number.replace(/-/g, '')}`}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
