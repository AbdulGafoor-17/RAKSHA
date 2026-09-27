import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import type { Report, Shelter, RouteData } from '../types';
import { useAuth } from './AuthContext';

export interface RerouteAlert {
  hazard: Report;
  newRoute: RouteData;
  alertTitle: string;
  alertMessage: string;
  timestamp: Date;
}

export interface BroadcastAlert {
  title: string;
  message: string;
  severity: string;
  timestamp: Date;
}

interface SocketContextType {
  isConnected: boolean;
  rerouteAlert: RerouteAlert | null;
  clearRerouteAlert: () => void;
  broadcastAlert: BroadcastAlert | null;
  clearBroadcastAlert: () => void;
  latestHazard: Report | null;
  latestShelterUpdate: Shelter | null;
  startEvacuationTracking: (data: {
    userId: string;
    startCoord: [number, number];
    shelterId: string;
    shelterCoord: [number, number];
    routeCoords: [number, number][];
  }) => void;
  stopEvacuationTracking: () => void;
  isEvacuating: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Web Audio API tactical sound synthesis (no external mp3 files needed, 100% reliable in any browser)
function playTacticalBeep(type: 'alert' | 'reroute' | 'ping') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'reroute') {
      // Urgent two-tone ascending tactical warning
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'alert') {
      // Rapid pulse
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else {
      // Subtle radar ping
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    // Audio context may be blocked by autoplay policies until user gesture
  }
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [rerouteAlert, setRerouteAlert] = useState<RerouteAlert | null>(null);
  const [broadcastAlert, setBroadcastAlert] = useState<BroadcastAlert | null>(null);
  const [latestHazard, setLatestHazard] = useState<Report | null>(null);
  const [latestShelterUpdate, setLatestShelterUpdate] = useState<Shelter | null>(null);
  const [isEvacuating, setIsEvacuating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:role', role);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for new hazards
    socket.on('hazard:new', (hazard: Report) => {
      setLatestHazard(hazard);
      if (soundEnabled) playTacticalBeep('alert');
    });

    // Listen for dynamic route recalculation (THE CORE WEBSOCKET EVENT)
    socket.on('route:recalculated', (data: RerouteAlert) => {
      console.log('🚨 [DYNAMIC REROUTE RECEIVED VIA WEBSOCKET]', data);
      setRerouteAlert(data);
      if (soundEnabled) playTacticalBeep('reroute');
    });

    // Listen for shelter capacity & supply updates
    socket.on('shelter:updated', (shelter: Shelter) => {
      setLatestShelterUpdate(shelter);
    });

    // Emergency broadcasts
    socket.on('emergency:broadcast', (alert: BroadcastAlert) => {
      setBroadcastAlert({ ...alert, timestamp: new Date() });
      if (soundEnabled) playTacticalBeep('alert');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('hazard:new');
      socket.off('route:recalculated');
      socket.off('shelter:updated');
      socket.off('emergency:broadcast');
    };
  }, [role, soundEnabled]);

  const startEvacuationTracking = useCallback(
    (data: {
      userId: string;
      startCoord: [number, number];
      shelterId: string;
      shelterCoord: [number, number];
      routeCoords: [number, number][];
    }) => {
      const socket = getSocket();
      socket.emit('evacuation:start', data);
      setIsEvacuating(true);
      if (soundEnabled) playTacticalBeep('ping');
    },
    [soundEnabled]
  );

  const stopEvacuationTracking = useCallback(() => {
    const socket = getSocket();
    socket.emit('evacuation:end');
    setIsEvacuating(false);
  }, []);

  const clearRerouteAlert = () => setRerouteAlert(null);
  const clearBroadcastAlert = () => setBroadcastAlert(null);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        rerouteAlert,
        clearRerouteAlert,
        broadcastAlert,
        clearBroadcastAlert,
        latestHazard,
        latestShelterUpdate,
        startEvacuationTracking,
        stopEvacuationTracking,
        isEvacuating,
        soundEnabled,
        toggleSound
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocketContext must be used within SocketProvider');
  return context;
}
