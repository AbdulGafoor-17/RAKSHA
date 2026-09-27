import React from 'react';
import { AlertTriangle, Compass, X } from 'lucide-react';
import { useSocketContext } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveCrisisTicker: React.FC = () => {
  const { rerouteAlert, clearRerouteAlert, broadcastAlert, clearBroadcastAlert, latestHazard } = useSocketContext();

  return (
    <div className="w-full relative z-30">
      {/* 1. DYNAMIC RE-ROUTING CRITICAL ALERT BANNER */}
      <AnimatePresence>
        {rerouteAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-b-2 border-red-500 shadow-[0_4px_25px_rgba(239,68,68,0.5)] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/40 border border-red-400/50 text-red-200 animate-pulse">
                  <Compass className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                      AUTONOMOUS DETOUR COMPUTED
                    </span>
                    <h4 className="font-display font-bold text-white text-sm sm:text-base">
                      {rerouteAlert.alertTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-red-100/90 font-sans mt-0.5 leading-relaxed">
                    {rerouteAlert.alertMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={clearRerouteAlert}
                  className="p-1 rounded-lg hover:bg-red-800/60 text-red-200 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. EMERGENCY BROADCAST BANNER */}
      <AnimatePresence>
        {broadcastAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-950/95 border-b border-red-500/50 shadow-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />
                <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wider">
                  EMERGENCY BROADCAST:
                </span>
                <span className="font-bold text-white text-xs sm:text-sm">{broadcastAlert.title}</span>
                <span className="text-xs text-slate-300 hidden md:inline">— {broadcastAlert.message}</span>
              </div>
              <button
                onClick={clearBroadcastAlert}
                className="p-1 rounded hover:bg-red-900/50 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SUBTLE AMBIENT STATUS TICKER */}
      <div className="bg-[#0b101c] border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            SYS: MONITORING
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            METROPOLITAN REGION: SAN FRANCISCO DOWNTOWN GRID
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 truncate pl-4">
          {latestHazard ? (
            <span className="text-amber-400 truncate animate-pulse">
              LATEST TELEMETRY: {latestHazard.title} ({latestHazard.severity.toUpperCase()})
            </span>
          ) : (
            <span className="text-slate-500 truncate">
              Dynamic path calculation engine synchronized with 5 Regional Safe Havens.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
