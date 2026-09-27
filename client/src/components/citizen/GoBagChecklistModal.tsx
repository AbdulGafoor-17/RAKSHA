import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckSquare, Square, PackageCheck } from 'lucide-react';

interface GoBagChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  detail: string;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: 'water', category: 'Sustenance', title: 'Water Rations (3 Liters / Person)', detail: 'Sealed containers for minimum 72h survival.' },
  { id: 'food', category: 'Sustenance', title: 'Non-Perishable High-Calorie Rations', detail: 'Energy bars, canned goods, protein pouches.' },
  { id: 'first_aid', category: 'Medical', title: 'Trauma & First Aid Kit', detail: 'Sterile gauze, tourniquet, antiseptic, band-aids.' },
  { id: 'meds', category: 'Medical', title: 'Critical Prescription Medications', detail: '7-day supply of personal medications & inhalers.' },
  { id: 'n95', category: 'Protection', title: 'N95 Respirator Masks', detail: 'Protection against particulate smoke, dust, and toxic spores.' },
  { id: 'flashlight', category: 'Tools', title: 'LED Flashlight & Extra Batteries', detail: 'High-lumen waterproof tactical torch.' },
  { id: 'powerbank', category: 'Comms', title: 'Charged High-Capacity Powerbank', detail: '10,000mAh+ battery with USB cables for cell phone.' },
  { id: 'docs', category: 'Security', title: 'Government ID, Passport & Cash', detail: 'Waterproof pouch with cash, identification & insurance cards.' },
  { id: 'blanket', category: 'Warmth', title: 'Emergency Mylar Space Blanket', detail: 'Thermal foil sheet to prevent hypothermia.' },
  { id: 'whistle', category: 'Signaling', title: 'High-Decibel Rescue Whistle', detail: 'Signal audible to urban search and rescue teams.' }
];

export const GoBagChecklistModal: React.FC<GoBagChecklistModalProps> = ({
  isOpen,
  onClose
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({
    water: true,
    first_aid: true,
    flashlight: true,
    powerbank: true
  });

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalCount = DEFAULT_ITEMS.length;
  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CITIZEN 72-HOUR CRISIS GO-BAG CHECKLIST"
      subtitle="Standard FEMA/Civil Protection packing manifest for rapid evacuation"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-cyan-400" />
              Preparedness Readiness Score
            </span>
            <span className="text-cyan-300 font-bold">
              {percentage}% Complete ({completedCount}/{totalCount})
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentage >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : percentage >= 50 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {DEFAULT_ITEMS.map((item) => {
            const isChecked = !!checkedIds[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-cyan-400">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-tight">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400">
            Keep bag near primary exit portal.
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="font-mono text-xs">
            Ready to Evacuate
          </Button>
        </div>
      </div>
    </Modal>
  );
};
