import { Server as SocketIOServer, Socket } from 'socket.io';
import { dbStore } from './dbStore.js';
import { routingService, checkRouteObstructions } from './routingService.js';

interface ActiveEvacuationSession {
  socketId: string;
  userId: string;
  startCoord: [number, number];
  shelterId: string;
  shelterCoord: [number, number];
  currentRouteCoords: [number, number][];
  registeredAt: Date;
}

let ioInstance: SocketIOServer | null = null;
const activeSessions = new Map<string, ActiveEvacuationSession>();

export function setupSocket(io: SocketIOServer) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Join room based on role
    socket.on('join:role', (role: string) => {
      socket.join(`role:${role}`);
      console.log(`📡 [Socket.io] Client ${socket.id} joined room role:${role}`);
    });

    // Register active evacuation route for dynamic hazard monitoring
    socket.on('evacuation:start', (data: {
      userId: string;
      startCoord: [number, number];
      shelterId: string;
      shelterCoord: [number, number];
      routeCoords: [number, number][];
    }) => {
      activeSessions.set(socket.id, {
        socketId: socket.id,
        userId: data.userId || 'anonymous-citizen',
        startCoord: data.startCoord,
        shelterId: data.shelterId,
        shelterCoord: data.shelterCoord,
        currentRouteCoords: data.routeCoords,
        registeredAt: new Date()
      });

      console.log(`🧭 [Evacuation Engine] Registered active routing session for client: ${socket.id}. Active sessions: ${activeSessions.size}`);
      socket.emit('evacuation:status', { active: true, message: 'Real-time hazard perimeter monitoring active.' });
    });

    // End evacuation tracking
    socket.on('evacuation:end', () => {
      activeSessions.delete(socket.id);
      console.log(`🛑 [Evacuation Engine] Evacuation ended for client: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      activeSessions.delete(socket.id);
      console.log(`❌ [Socket.io] Client disconnected: ${socket.id}`);
    });
  });
}

// Function to call whenever a new hazard is created or injected
export async function notifyNewHazardAndCheckRoutes(newHazard: any) {
  if (!ioInstance) return;

  // 1. Broadcast new hazard to all connected clients
  ioInstance.emit('hazard:new', newHazard);
  console.log(`🚨 [Alert Broadcast] New hazard broadcasted: ${newHazard.title}`);

  // 2. Scan active evacuation sessions for route collision
  const activeHazards = await dbStore.getActiveHazards();

  for (const [socketId, session] of activeSessions.entries()) {
    const obstruction = checkRouteObstructions(session.currentRouteCoords, [newHazard]);

    if (obstruction.isObstructed) {
      console.log(`⚡ [DYNAMIC RE-ROUTING TRIGGERED] Hazard "${newHazard.title}" directly blocks evacuation route for client ${socketId}!`);

      // Recalculate safe detour route avoiding all active hazards
      const recalculated = await routingService.calculateEvacuationRoute(
        session.startCoord,
        session.shelterCoord,
        activeHazards
      );

      // Update session's active route
      session.currentRouteCoords = recalculated.coordinates;
      activeSessions.set(socketId, session);

      // Emit high-priority dynamic recalculation event to the affected citizen
      ioInstance.to(socketId).emit('route:recalculated', {
        hazard: newHazard,
        newRoute: recalculated,
        alertTitle: '⚠️ HAZARD BLOCK DETECTED ON YOUR PATH',
        alertMessage: `A critical hazard (${newHazard.title}) was just reported directly obstructing your evacuation route. RAKSHA has dynamically calculated a safe detour avoiding the hazard perimeter.`,
        timestamp: new Date()
      });

      // Also notify authorities of the automatic recalculation
      ioInstance.to('role:authority').emit('authority:reroute_event', {
        citizenSessionId: socketId,
        hazardId: newHazard._id || newHazard.id,
        hazardTitle: newHazard.title,
        shelterId: session.shelterId,
        timestamp: new Date()
      });
    }
  }
}

export function broadcastShelterUpdate(shelter: any) {
  if (ioInstance) {
    ioInstance.emit('shelter:updated', shelter);
  }
}

export function broadcastReportUpdate(report: any) {
  if (ioInstance) {
    ioInstance.emit('report:updated', report);
  }
}

export function broadcastEmergencyAlert(alert: { title: string; message: string; severity: string }) {
  if (ioInstance) {
    ioInstance.emit('emergency:broadcast', alert);
  }
}

export function getActiveEvacuationSessionsCount(): number {
  return activeSessions.size;
}
