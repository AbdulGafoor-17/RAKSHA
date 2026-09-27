# 🛡️ RAKSHA — Real-Time Disaster Response & Evacuation Platform

> Autonomous dynamic routing, real-time WebSocket coordination, and multi-role emergency management for flood/disaster scenarios.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS v4 |
| 3D Hero | Three.js (terrain flood scene) |
| Maps | Leaflet + OpenStreetMap / CartoDB |
| Real-time | Socket.io (bidirectional WebSocket) |
| Routing | OpenRouteService API + Smart Fallback Engine |
| Backend | Express.js + TypeScript |
| Database | MongoDB (Atlas) / In-memory fallback |
| Auth | JWT |

---

## 🚀 Deployment

### Prerequisites
- GitHub account
- [Vercel](https://vercel.com) account (free)
- [Render](https://render.com) account (free)
- [MongoDB Atlas](https://mongodb.com/atlas) account (free M0 cluster)

---

### Step 1 — Push to GitHub

```bash
# In the project root (d:/Full Stack project)
git init
git add .
git commit -m "feat: initial RAKSHA platform commit"

# Create a new repo on GitHub (no README, no .gitignore — already have them)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/raksha-platform.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Fill in the settings:

| Field | Value |
|---|---|
| **Name** | `raksha-server` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://...` ← your Atlas URI |
| `JWT_SECRET` | any strong random string |
| `ORS_API_KEY` | your OpenRouteService key *(optional)* |
| `CLIENT_URL` | `https://your-app.vercel.app` ← fill after Step 3 |

5. Click **Create Web Service**. Wait for the build to complete.
6. Copy your **Render service URL** (e.g. `https://raksha-server.onrender.com`)

> ⚠️ **Free tier note**: Render free services spin down after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to Starter ($7/mo) for always-on.

---

### Step 3 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure the project:

| Field | Value |
|---|---|
| **Root Directory** | `client` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://raksha-server.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://raksha-server.onrender.com` |

5. Click **Deploy**. Vercel will give you a URL like `https://raksha-platform.vercel.app`

6. **Go back to Render** → your service → Environment → update `CLIENT_URL` to your Vercel URL → Save (triggers redeploy)

---

### Step 4 — MongoDB Atlas Setup (if using persistent DB)

1. Create a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist IP: `0.0.0.0/0` (allows Render's dynamic IPs)
4. Get the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/raksha`
5. Set it as `MONGODB_URI` in Render

> **Without MongoDB**: The app works fully with its built-in in-memory datastore. Data resets on each server restart — fine for demos.

---

## 🏃 Local Development

```bash
# Install all dependencies
cd server && npm install
cd ../client && npm install
cd ..

# Create server env file
cp server/.env.example server/.env
# Edit server/.env with your values

# Create client env file (optional for local dev — defaults to localhost)
cp client/.env.example client/.env.local

# Start both servers concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 📁 Project Structure

```
raksha-platform/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components (citizen, authority, shelter, map, hero)
│   │   ├── context/         # Auth + Socket React contexts
│   │   ├── pages/           # LandingPage
│   │   ├── services/        # api.ts + socket.ts
│   │   └── types/           # Shared TypeScript types
│   ├── vercel.json          # Vercel SPA routing config
│   └── .env.example         # Client env variable template
├── server/                  # Express + Socket.io backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routers
│   │   ├── services/        # dbStore, routingService, socketService
│   │   └── seeds/           # Seed data
│   └── .env.example         # Server env variable template
├── render.yaml              # Render.com deployment config
├── .gitignore
└── README.md
```

---

## 🌐 Live Demo Roles

| Role | Access |
|---|---|
| **Citizen Evacuee** | Hazard reporting, live map, evacuation route, SOS hotlines |
| **Emergency Authority** | Command center, incident triage, broadcast alerts, SITREP |
| **Shelter Admin** | Capacity control, evacuee intake, supply logistics |

> Switch roles freely from the landing page — no login required for demo mode.

---

## ⚡ Core Feature: Dynamic Rerouting

When a hazard is reported, the server:
1. Computes orthogonal line-segment distances from the hazard to all active evacuation route polylines
2. Identifies affected citizen sessions via WebSocket session registry
3. Recalculates a safe detour using OpenRouteService (or the built-in perpendicular bypass engine)
4. Pushes the new route + audio alert to affected citizens in **<50ms**

---

## License

MIT © RAKSHA Core Team
