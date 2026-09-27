import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { ReportType, SeverityLevel } from '../../types';
import { AlertTriangle, MapPin, CheckCircle2 } from 'lucide-react';

interface ReportHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords?: [number, number];
  onReportCreated?: () => void;
}

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({
  isOpen,
  onClose,
  defaultCoords = [-122.4150, 37.7750],
  onReportCreated
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<ReportType>('hazard');
  const [hazardCategory, setHazardCategory] = useState('flood');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('high');
  const [address, setAddress] = useState('Market St Corridor');
  const [coordinates, setCoordinates] = useState<[number, number]>(defaultCoords);
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (defaultCoords) {
      setCoordinates(defaultCoords);
    }
  }, [defaultCoords]);

  const samplePhotos = [
    { label: 'Flood Surge', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80' },
    { label: 'Debris / Bridge', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80' },
    { label: 'Fire Smoke', url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80' },
    { label: 'Downed Wire', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await api.createReport({
        type,
        hazardCategory,
        title,
        description,
        coordinates,
        address,
        severity,
        photoUrl,
        reportedBy: {
          id: user?.id || 'citizen-field',
          name: user?.name || 'Citizen Responder',
          role: user?.role || 'citizen'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onReportCreated) onReportCreated();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SUBMIT CITIZEN EMERGENCY REPORT"
      subtitle="Broadcast a real-time hazard obstacle or emergency supply need to the regional grid"
      maxWidth="xl"
    >
      {success ? (
        <div className="py-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold font-display text-white mb-1">
            Report Transmitted to Command Grid
          </h4>
          <p className="text-xs text-slate-400 font-mono">
            Telemetry dispatched • Hazard perimeter calculated • Active routes scanned
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type Toggle */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Incident Category Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('hazard')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                  type === 'hazard'
                    ? 'bg-red-950/80 border-red-500/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ⚠️ PHYSICAL HAZARD / OBSTACLE
              </button>
              <button
                type="button"
                onClick={() => setType('need')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                  type === 'need'
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                🆘 CITIZEN RELIEF NEED
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Incident Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Flood Inundation & Submerged Cars"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-red-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          {/* Category & Severity in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Hazard Specifics
              </label>
              <select
                value={hazardCategory}
                onChange={(e) => setHazardCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm outline-none"
              >
                <option value="flood">Flood / Water Surge</option>
                <option value="fire">Fire / Smoke Plume</option>
                <option value="road_blocked">Roadway Blocked / Collapse</option>
                <option value="structural_collapse">Building Damage</option>
                <option value="gas_leak">Gas Leak / Hazmat</option>
                <option value="medical">Medical Emergency</option>
                <option value="water_food">Water / Food Depleted</option>
                <option value="other">Other Incident</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Threat Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm outline-none font-semibold"
              >
                <option value="low">Low (Passable)</option>
                <option value="medium">Medium (Slowdown)</option>
                <option value="high">High (Dangerous)</option>
                <option value="critical">Critical (Life Threatening / Blocked)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Situation Description
            </label>
            <textarea
              rows={2}
              placeholder="Provide situational details (e.g. water depth, live sparks, people stranded)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs outline-none focus:border-red-500"
            />
          </div>

          {/* Address & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Approximate Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                GPS Coordinates [Lng, Lat]
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Photo sample selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
              <span>Incident Field Photo</span>
              <span className="text-[10px] text-slate-500">Select preset or provide URL</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-2">
              {samplePhotos.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhotoUrl(p.url)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    photoUrl === p.url
                      ? 'bg-red-500/20 text-red-300 border-red-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {photoUrl && (
              <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-800 relative group">
                <img src={photoUrl} alt="Incident preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-mono text-slate-300">Verified Evidence Uploaded</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={type === 'hazard' ? 'danger' : 'primary'}
              size="md"
              type="submit"
              loading={loading}
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              TRANSMIT INCIDENT
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
