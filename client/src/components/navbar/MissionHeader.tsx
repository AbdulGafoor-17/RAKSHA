import React, { useEffect, useState } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  AlertTriangle,
  Users,
  Building,
  Activity,
  PhoneCall,
  PackageCheck,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { PulsingBeacon } from '../common/PulsingBeacon';
import type { UserRole } from '../../types';

interface MissionHeaderProps {
  currentView: string;
  onNavigate: (view: 'landing' | 'citizen' | 'authority' | 'shelter' | 'auth') => void;
  onOpenSimulator: () => void;
  onOpenHotlines: () => void;
  onOpenChecklist: () => void;
  onOpenSitrep?: () => void;
}

export const MissionHeader: React.FC<MissionHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSimulator,
  onOpenHotlines,
  onOpenChecklist,
  onOpenSitrep
}) => {
  const { user, role, switchRole } = useAuth();
  const { isConnected, soundEnabled, toggleSound } = useSocketContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    await switchRole(newRole);
    if (newRole === 'citizen') onNavigate('citizen');
    else if (newRole === 'authority') onNavigate('authority');
    else if (newRole === 'shelter_admin') onNavigate('shelter');
    setMobileMenuOpen(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === '1') handleRoleChange('citizen');
      if (e.key === '2') handleRoleChange('authority');
      if (e.key === '3') handleRoleChange('shelter_admin');
      if (e.key.toLowerCase() === 's') onOpenSimulator();
      if (e.key.toLowerCase() === 'm') toggleSound();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070a10]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => {
            onNavigate('landing');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-blue-700 p-0.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl font-display tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                RAKSHA
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                GRID LIVE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider hidden md:block">
              AUTONOMOUS DISASTER RESPONSE & REROUTING
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'landing'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleRoleChange('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'citizen'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen Evac</span>
          </button>

          <button
            onClick={() => handleRoleChange('authority')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'authority'
                ? 'bg-blue-950 text-blue-300 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => handleRoleChange('shelter_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'shelter'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Shelter Ops</span>
          </button>
        </nav>

        {/* Action Controls & Simulator Trigger */}
        <div className="flex items-center gap-2">
          {/* Emergency SOS Hotlines trigger */}
          <button
            onClick={onOpenHotlines}
            title="Emergency Hotlines & 911"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-mono text-xs font-semibold transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">SOS Hotlines</span>
          </button>

          {/* Go-Bag checklist trigger */}
          <button
            onClick={onOpenChecklist}
            title="72-Hour Survival Go-Bag Checklist"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono transition-all"
          >
            <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Go-Bag</span>
          </button>

          {/* SITREP briefing trigger for authority */}
          {currentView === 'authority' && onOpenSitrep && (
            <button
              onClick={onOpenSitrep}
              title="Generate Military SITREP"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-300 text-xs font-mono font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SITREP</span>
            </button>
          )}

          {/* Socket status */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/70 border border-slate-800">
            <PulsingBeacon
              status={isConnected ? 'safe' : 'critical'}
              size="sm"
              label={isConnected ? 'GRID LIVE' : 'OFFLINE'}
            />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio Alerts (M)' : 'Enable Audio Alerts (M)'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* DISASTER SIMULATOR QUICK TRIGGER */}
          <button
            onClick={onOpenSimulator}
            title="Open Disaster Simulator Deck (S)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold shadow-[0_0_18px_rgba(239,68,68,0.45)] border border-red-400/40 active:scale-95 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            <span>SIMULATOR</span>
          </button>

          {/* Role Pill */}
          <div
            onClick={() => onNavigate('auth')}
            className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              {user?.name?.[0] || 'C'}
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-200 leading-tight truncate max-w-[100px]">
                {user?.name || 'Citizen'}
              </div>
              <div className="font-mono text-[9px] text-slate-400 uppercase">
                {role.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d131f] border-b border-slate-800 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white text-left"
            >
              Overview
            </button>
            <button
              onClick={() => handleRoleChange('citizen')}
              className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 text-left flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5" /> Citizen Portal
            </button>
            <button
              onClick={() => handleRoleChange('authority')}
              className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/40 text-xs font-mono text-blue-300 text-left flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" /> Command Center
            </button>
            <button
              onClick={() => handleRoleChange('shelter_admin')}
              className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 text-left flex items-center gap-2"
            >
              <Building className="w-3.5 h-3.5" /> Shelter Ops
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                onOpenChecklist();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-mono text-cyan-400 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" /> Go-Bag Checklist
            </button>
            <div className="text-[10px] font-mono text-slate-500">
              Keys: 1=Citizen, 2=Command, 3=Shelter, S=Sim
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
