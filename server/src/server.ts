import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { inMemoryDB } from './services/dbStore.js';
import { setupSocket } from './services/socketService.js';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import shelterRoutes from './routes/shelterRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import simRoutes from './routes/simRoutes.js';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with robust CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

// Allow large payloads for incident photos
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Setup WebSockets
setupSocket(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'RAKSHA Autonomous Disaster Response & Evacuation Grid',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/simulation', simRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err?.message || 'Unknown error' });
});

// Start Server
async function startServer() {
  await connectDB();
  await inMemoryDB.ensureMongoSeeded();

  server.listen(ENV.PORT, () => {
    console.log(`
══════════════════════════════════════════════════════════════════════
  🛡️  RAKSHA REAL-TIME DISASTER COORDINATION ENGINE ONLINE
══════════════════════════════════════════════════════════════════════
  📡  Server Port:        ${ENV.PORT}
  🌐  API Base:           http://localhost:${ENV.PORT}/api
  ⚡  Real-Time Socket:   Online (Dynamic Rerouting Engine Active)
  🛰️  Routing Service:    OpenRouteService + Smart Tactical Detour
  🚀  Client Target:      ${ENV.CLIENT_URL}
══════════════════════════════════════════════════════════════════════
    `);
  });
}

startServer();
