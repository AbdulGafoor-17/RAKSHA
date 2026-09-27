import React, { useState } from 'react';
import type { Report, SeverityLevel, ReportStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { UnitDispatchModal } from './UnitDispatchModal';
import {
  Search,
  CheckCircle,
  Truck,
  Eye,
  MapPin
} from 'lucide-react';

interface IncidentFilterTableProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onUpdateStatus: (id: string, status: ReportStatus, dispatchNotes?: string) => void;
}

export const IncidentFilterTable: React.FC<IncidentFilterTableProps> = ({
  reports,
  onSelectReport,
  onUpdateStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');

  // Dispatch modal state
  const [dispatchReport, setDispatchReport] = useState<Report | null>(null);

  // Compute category counts for quick-pills
  const categoryCounts: Record<string, number> = {
    all: reports.length,
    flood: reports.filter((r) => r.hazardCategory === 'flood').length,
    road_blocked: reports.filter((r) => r.hazardCategory === 'road_blocked').length,
    fire: reports.filter((r) => r.hazardCategory === 'fire').length,
    structural_collapse: reports.filter((r) => r.hazardCategory === 'structural_collapse').length,
    gas_leak: reports.filter((r) => r.hazardCategory === 'gas_leak').length
  };

  const filteredReports = reports.filter((r) => {
    if (categoryFilter !== 'all' && r.hazardCategory !== categoryFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const matchTitle = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAddress = r.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = r.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchAddress || matchDesc;
    }
    return true;
  });

  const handleDispatchConfirmed = (reportId: string, unitName: string, notes: string) => {
    onUpdateStatus(reportId, 'dispatched', `Unit: ${unitName} - ${notes}`);
  };

  return (
    <>
      <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
        {/* Category Quick Pills */}
        <div className="px-4 py-2.5 bg-[#090d18] border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1 shrink-0">
            QUICK TRIAGE:
          </span>

          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Incidents ({categoryCounts.all})
          </button>

          <button
            onClick={() => setCategoryFilter('flood')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
              categoryFilter === 'flood'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🌊 Floods ({categoryCounts.flood})
          </button>

          <button
            onClick={() => setCategoryFilter('road_blocked')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
              categoryFilter === 'road_blocked'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🚧 Blockades ({categoryCounts.road_blocked})
          </button>

          <button
            onClick={() => setCategoryFilter('fire')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
              categoryFilter === 'fire'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🔥 Fires ({categoryCounts.fire})
          </button>

          <button
            onClick={() => setCategoryFilter('structural_collapse')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
              categoryFilter === 'structural_collapse'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🏚️ Collapse ({categoryCounts.structural_collapse})
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active incidents, streets, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="dispatched">Dispatched</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 max-h-[480px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b101c] border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Severity & Incident</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Coordinates & Location</th>
                <th className="py-3 px-4">Status & Radius</th>
                <th className="py-3 px-4 text-right">Dispatch & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 font-mono text-xs">
                    No active incident telemetry matching current filter query.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id || report._id}
                    className="hover:bg-slate-900/60 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.severity as any}>
                          {report.severity.toUpperCase()}
                        </Badge>
                        <span className="font-bold text-white group-hover:text-blue-300 transition-colors font-display">
                          {report.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 max-w-sm">
                        {report.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] capitalize">
                        {report.hazardCategory.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="block font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {report.address}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {report.location.coordinates[0].toFixed(4)}, {report.location.coordinates[1].toFixed(4)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.status as any}>
                          {report.status.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">
                          {report.impactRadiusMeters || 160}m radius
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectReport(report)}
                        title="Locate & inspect on map"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {report.status === 'active' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setDispatchReport(report)}
                          icon={<Truck className="w-3 h-3" />}
                          className="text-[11px] font-mono"
                        >
                          Dispatch Unit
                        </Button>
                      )}

                      {report.status === 'dispatched' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onUpdateStatus(report.id || report._id!, 'resolved')}
                          icon={<CheckCircle className="w-3 h-3" />}
                          className="text-[11px] font-mono"
                        >
                          Mark Resolved
                        </Button>
                      )}

                      {report.status === 'resolved' && (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30">
                          CLEARED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit Dispatch Modal */}
      <UnitDispatchModal
        isOpen={!!dispatchReport}
        onClose={() => setDispatchReport(null)}
        report={dispatchReport}
        onDispatchConfirmed={handleDispatchConfirmed}
      />
    </>
  );
};
