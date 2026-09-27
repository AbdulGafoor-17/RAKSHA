import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { notifyNewHazardAndCheckRoutes, broadcastEmergencyAlert } from '../services/socketService.js';

export const simController = {
  // Inject a single hazard at specified or preset coordinates
  async injectHazard(req: Request, res: Response) {
    try {
      const { title, hazardCategory, coordinates, severity, impactRadiusMeters } = req.body;

      // Default to Downtown San Francisco transit hub if not specified
      const targetCoords: [number, number] = coordinates && coordinates.length === 2
        ? [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        : [-122.4120 + (Math.random() - 0.5) * 0.02, 37.7780 + (Math.random() - 0.5) * 0.02];

      const newHazard = await dbStore.createReport({
        type: 'hazard',
        hazardCategory: hazardCategory || 'flood',
        title: title || 'Simulated Flash Flood Surge',
        description: 'AUTOMATED SIMULATION INJECTION: Sensor triggered water level spike exceeding 4.2 feet.',
        location: {
          type: 'Point',
          coordinates: targetCoords
        },
        address: 'Live Simulation Test Zone',
        severity: severity || 'critical',
        impactRadiusMeters: impactRadiusMeters || 220,
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        reportedBy: { id: 'sim-engine', name: 'RAKSHA Autonomous Simulator', role: 'authority' },
        verified: true,
        dispatchNotes: 'Automated high-priority simulation event.'
      });

      // Instantly scan active routes and broadcast
      await notifyNewHazardAndCheckRoutes(newHazard);

      return res.status(201).json({
        message: 'Hazard injected successfully into live monitoring grid.',
        hazard: newHazard
      });
    } catch (err: any) {
      console.error('Simulation error:', err);
      return res.status(500).json({ error: 'Failed to inject simulation event.' });
    }
  },

  // LIVE DEMO SHOWCASE: Specifically drop a critical roadblock onto a citizen's active route!
  async blockActiveRoute(req: Request, res: Response) {
    try {
      const { routeCoordinates, title } = req.body;

      let targetCoord: [number, number];

      if (routeCoordinates && Array.isArray(routeCoordinates) && routeCoordinates.length >= 2) {
        // Pick the midpoint of the route so it's guaranteed to be in the citizen's direct path!
        const midIdx = Math.floor(routeCoordinates.length / 2);
        targetCoord = routeCoordinates[midIdx];
      } else {
        // Default midpoint between Mission and Civic Center
        targetCoord = [-122.4158, 37.7770];
      }

      const blockingHazard = await dbStore.createReport({
        type: 'hazard',
        hazardCategory: 'road_blocked',
        title: title || 'LIVE DEMO: Sudden Structural Bridge Collapse & Inundation',
        description: 'LIVE DEMO SIMULATION EVENT: Main transit artery obstructed. Road surface impassable. Instant detour required.',
        location: {
          type: 'Point',
          coordinates: targetCoord
        },
        address: 'Direct Evacuation Path Intersection',
        severity: 'critical',
        impactRadiusMeters: 250,
        status: 'active',
        photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
        reportedBy: { id: 'sim-command', name: 'DEMO HAZARD INJECTOR', role: 'authority' },
        verified: true,
        dispatchNotes: 'Critical obstacle injected on evacuation polyline.'
      });

      // Broadcast and recalculate
      await notifyNewHazardAndCheckRoutes(blockingHazard);

      return res.status(201).json({
        message: 'Hazard planted directly on active route. Dynamic recalculation dispatched via WebSockets!',
        hazard: blockingHazard,
        interceptCoordinate: targetCoord
      });
    } catch (err: any) {
      console.error('Error blocking route:', err);
      return res.status(500).json({ error: 'Failed to plant route blockage.' });
    }
  },

  // Trigger preset scenario
  async triggerScenario(req: Request, res: Response) {
    try {
      const { scenarioType } = req.body;

      if (scenarioType === 'flash_flood') {
        broadcastEmergencyAlert({
          title: 'LEVEL 4 FLASH FLOOD EMERGENCY',
          message: 'Atmospheric river event causing rapid urban inundation. Evacuate low-lying streets to high-elevation shelters immediately.',
          severity: 'critical'
        });

        // Inject 2 coordinated flood zones
        const flood1 = await dbStore.createReport({
          type: 'hazard',
          hazardCategory: 'flood',
          title: 'Mission Creek Overflow & Submerged Subway Entrance',
          description: 'Water depth 4.5 ft and surging. Transit tracks submerged.',
          location: { type: 'Point', coordinates: [-122.4110, 37.7690] },
          address: 'Mission Creek Basin',
          severity: 'critical',
          impactRadiusMeters: 260,
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
          reportedBy: { id: 'sim-flood', name: 'Hydrological Sensor Network', role: 'authority' },
          verified: true
        });

        await notifyNewHazardAndCheckRoutes(flood1);
      } else if (scenarioType === 'earthquake') {
        broadcastEmergencyAlert({
          title: 'MAGNITUDE 6.8 SEISMIC EVENT DETECTED',
          message: 'Severe ground displacement. Inspect structures for secondary collapse hazards. Avoid overhead transit lines.',
          severity: 'critical'
        });

        const quakeHazard = await dbStore.createReport({
          type: 'hazard',
          hazardCategory: 'structural_collapse',
          title: 'High-Rise Glass Façade Failure & Gas Rupture',
          description: 'Shattered glass showering multi-lane boulevard. Active natural gas odor.',
          location: { type: 'Point', coordinates: [-122.4040, 37.7870] },
          address: 'Financial Center Plaza',
          severity: 'critical',
          impactRadiusMeters: 240,
          status: 'active',
          photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
          reportedBy: { id: 'sim-quake', name: 'Seismic Telemetry Node', role: 'authority' },
          verified: true
        });

        await notifyNewHazardAndCheckRoutes(quakeHazard);
      }

      return res.json({ message: `Scenario "${scenarioType}" activated successfully.` });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to run scenario.' });
    }
  },

  // Reset demo data
  async resetDemoData(req: Request, res: Response) {
    try {
      await dbStore.resetData();
      return res.json({ message: 'All demo hazards, shelters, and mock records restored to initial state.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reset demo dataset.' });
    }
  }
};
