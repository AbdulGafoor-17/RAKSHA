import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { Report, Shelter } from '../../types';
import { Copy, Check, Printer } from 'lucide-react';

interface SituationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  shelters: Shelter[];
}

export const SituationReportModal: React.FC<SituationReportModalProps> = ({
  isOpen,
  onClose,
  reports,
  shelters
}) => {
  const [copied, setCopied] = useState(false);

  const activeHazards = reports.filter((r) => r.type === 'hazard' && r.status !== 'resolved');
  const criticalHazards = reports.filter((r) => r.severity === 'critical' && r.status !== 'resolved');
  const totalBeds = shelters.reduce((acc, s) => acc + (s.capacityAvailable || 0), 0);
  const totalEvacuees = shelters.reduce((acc, s) => acc + (s.activeEvacueesCount || 0), 0);
  const timeStr = new Date().toLocaleString();

  const sitrepText = `================================================================================
RAKSHA EMERGENCY SITUATION REPORT (SITREP) #04-ALPHA
TIMESTAMP: ${timeStr}
REGION: San Francisco Downtown & Coastal Sector
INCIDENT COMMAND STATUS: LEVEL 1 RED ALERT
================================================================================

1. EXECUTIVE SITUATIONAL SUMMARY
--------------------------------------------------------------------------------
Total Monitored Incidents : ${reports.length}
Active Hazard Obstacles   : ${activeHazards.length}
Critical Route Blockades  : ${criticalHazards.length}
Registered Evacuees       : ${totalEvacuees}
Available Bed Capacity    : ${totalBeds} across ${shelters.length} Safe Havens
Dynamic Routing Engine    : ACTIVE (OpenRouteService & 2dsphere GIS synchronized)

2. CRITICAL INCIDENT LOG (ACTIVE BLOCKADES)
--------------------------------------------------------------------------------
${activeHazards
  .map(
    (h, idx) =>
      `[#${idx + 1}] ${h.title.toUpperCase()}
  Category: ${h.hazardCategory} | Severity: ${h.severity.toUpperCase()} | Status: ${h.status.toUpperCase()}
  Location: ${h.address} [${h.location.coordinates[0].toFixed(4)}, ${h.location.coordinates[1].toFixed(4)}]
  Radius  : ${h.impactRadiusMeters || 160}m danger perimeter
  Details : ${h.description}
`
  )
  .join('\n')}

3. SHELTER FACILITY MANIFEST & INTAKE
--------------------------------------------------------------------------------
${shelters
  .map(
    (s, idx) =>
      `[${idx + 1}] ${s.name}
  Address    : ${s.address}
  Beds Avail : ${s.capacityAvailable} / ${s.capacityTotal} Total (${Math.round(
        ((s.capacityTotal - s.capacityAvailable) / s.capacityTotal) * 100
      )}% Occupancy)
  Active Intake: ${s.activeEvacueesCount} citizens sheltered
  Power Grid : ${s.suppliesStatus?.power?.toUpperCase() || 'OPERATIONAL'}
  Medical    : ${s.suppliesStatus?.medical?.toUpperCase() || 'AMPLE'}
`
  )
  .join('\n')}

4. COMMAND DIRECTIVES
--------------------------------------------------------------------------------
- Continuous surveillance on low-lying street corridors.
- Citizen mobile nodes automatically routed to nearest surplus capacity facility.
- Multi-agency mutual aid coordination established.

AUTHORITY: Metropolitan Emergency Operations Command
SITREP TRANSMITTED VIA RAKSHA CORE TELEMETRY GRID
================================================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; padding: 20px; white-space: pre-wrap;">${sitrepText}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="METROPOLITAN SITUATION REPORT (SITREP)"
      subtitle="Standard civil defense operational summary generated from real-time database telemetry"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ACTIVE HAZARDS</span>
            <span className="text-lg font-bold text-red-400">{activeHazards.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">CRITICAL BLOCKAGES</span>
            <span className="text-lg font-bold text-amber-400">{criticalHazards.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">BED SURPLUS</span>
            <span className="text-lg font-bold text-emerald-400">{totalBeds}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">SHELTERED CITIZENS</span>
            <span className="text-lg font-bold text-cyan-400">{totalEvacuees}</span>
          </div>
        </div>

        {/* Text Box Terminal Preview */}
        <div className="bg-[#050811] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-[380px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
          {sitrepText}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} className="font-mono text-xs">
            Close Deck
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
              className="font-mono text-xs"
            >
              Print SITREP
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              className="font-mono text-xs"
            >
              {copied ? 'SITREP Copied' : 'Copy Formatted Text'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
