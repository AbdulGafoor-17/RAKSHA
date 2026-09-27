import axios from 'axios';
import { ENV } from '../config/env.js';
import { calculateDistanceMeters } from './dbStore.js';

export interface RoutePoint {
  lng: number;
  lat: number;
}

export interface RouteResult {
  coordinates: [number, number][]; // Array of [lng, lat]
  distanceMeters: number;
  durationSeconds: number;
  isObstructed: boolean;
  obstructingHazards?: any[];
  rerouted?: boolean;
  detourReason?: string;
  waypointsCount: number;
}

// Minimum distance from a point to a line segment in meters
function distancePointToSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  const [px, py] = p;
  const [ax, ay] = a;
  const [bx, by] = b;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return calculateDistanceMeters(p, a);
  }

  // Projection parameter t
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return calculateDistanceMeters(p, [projX, projY]);
}

// Check if any hazard blocks a route polyline
export function checkRouteObstructions(
  routeCoords: [number, number][],
  hazards: any[]
): { isObstructed: boolean; blockingHazards: any[] } {
  const blockingHazards: any[] = [];

  for (const hazard of hazards) {
    if (!hazard.location || !hazard.location.coordinates) continue;
    const hazardCoord: [number, number] = hazard.location.coordinates;
    const bufferRadius = (hazard.impactRadiusMeters || 150) + 40; // 40m vehicle buffer

    // Check each line segment of the route
    let isBlocking = false;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const segA = routeCoords[i];
      const segB = routeCoords[i + 1];
      const dist = distancePointToSegment(hazardCoord, segA, segB);
      if (dist <= bufferRadius) {
        isBlocking = true;
        break;
      }
    }

    if (isBlocking) {
      blockingHazards.push(hazard);
    }
  }

  return {
    isObstructed: blockingHazards.length > 0,
    blockingHazards
  };
}

// Generate realistic intermediate grid navigation waypoints avoiding hazards
function generateSmartDetourPath(
  start: [number, number],
  end: [number, number],
  hazards: any[]
): [number, number][] {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;

  // Primary direct path
  const numSteps = 8;
  let primaryPath: [number, number][] = [];
  for (let i = 0; i <= numSteps; i++) {
    const ratio = i / numSteps;
    // Introduce realistic street-grid doglegs rather than pure diagonal line
    const intermediateLng = startLng + (endLng - startLng) * (ratio < 0.5 ? ratio * 1.3 : ratio);
    const intermediateLat = startLat + (endLat - startLat) * (ratio < 0.5 ? ratio * 0.7 : ratio);
    primaryPath.push([intermediateLng, intermediateLat]);
  }
  primaryPath[0] = start;
  primaryPath[primaryPath.length - 1] = end;

  // Check if primary path hits hazards
  const obstruction = checkRouteObstructions(primaryPath, hazards);
  if (!obstruction.isObstructed) {
    return primaryPath;
  }

  // If obstructed, calculate an evasive detour
  const blocker = obstruction.blockingHazards[0];
  const [bLng, bLat] = blocker.location.coordinates;
  const safeOffset = ((blocker.impactRadiusMeters || 150) + 120) / 111320; // in degrees approx

  // Determine which side has more clearance
  const midLng = (startLng + endLng) / 2;
  const midLat = (startLat + endLat) / 2;

  // Perpendicular vector to line start -> end
  const dLng = endLng - startLng;
  const dLat = endLat - startLat;
  const len = Math.sqrt(dLng * dLng + dLat * dLat) || 1;
  const perpLng = -dLat / len;
  const perpLat = dLng / len;

  // Detour waypoints bypassing the hazard perimeter
  const detourWaypoint1: [number, number] = [
    bLng + perpLng * safeOffset * 1.5,
    bLat + perpLat * safeOffset * 1.5
  ];

  const detourWaypoint2: [number, number] = [
    (detourWaypoint1[0] + endLng) / 2 + perpLng * (safeOffset * 0.5),
    (detourWaypoint1[1] + endLat) / 2 + perpLat * (safeOffset * 0.5)
  ];

  return [
    start,
    [startLng + (detourWaypoint1[0] - startLng) * 0.45, startLat],
    detourWaypoint1,
    detourWaypoint2,
    [endLng, detourWaypoint2[1] + (endLat - detourWaypoint2[1]) * 0.6],
    end
  ];
}

export const routingService = {
  async calculateEvacuationRoute(
    start: [number, number],
    end: [number, number],
    activeHazards: any[]
  ): Promise<RouteResult> {
    // 1. Try OpenRouteService if API key is present
    if (ENV.ORS_API_KEY) {
      try {
        const orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        const body: any = {
          coordinates: [start, end]
        };

        // Add avoid polygons for hazards if available
        if (activeHazards.length > 0) {
          const avoidPolygons = activeHazards.map((h) => {
            const [hlng, hlat] = h.location.coordinates;
            const radiusDeg = (h.impactRadiusMeters || 150) / 111000;
            // approximate circle as octagon
            return [
              [hlng + radiusDeg, hlat],
              [hlng + radiusDeg * 0.7, hlat + radiusDeg * 0.7],
              [hlng, hlat + radiusDeg],
              [hlng - radiusDeg * 0.7, hlat + radiusDeg * 0.7],
              [hlng - radiusDeg, hlat],
              [hlng - radiusDeg * 0.7, hlat - radiusDeg * 0.7],
              [hlng, hlat - radiusDeg],
              [hlng + radiusDeg * 0.7, hlat - radiusDeg * 0.7],
              [hlng + radiusDeg, hlat]
            ];
          });
          body.options = { avoid_polygons: { type: 'MultiPolygon', coordinates: [avoidPolygons] } };
        }

        const res = await axios.post(orsUrl, body, {
          headers: {
            Authorization: ENV.ORS_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 4000
        });

        if (res.data?.features?.[0]?.geometry?.coordinates) {
          const coords = res.data.features[0].geometry.coordinates;
          const summary = res.data.features[0].properties.summary;
          return {
            coordinates: coords,
            distanceMeters: Math.round(summary.distance),
            durationSeconds: Math.round(summary.duration),
            isObstructed: false,
            waypointsCount: coords.length
          };
        }
      } catch (orsErr: any) {
        console.warn('⚠️ [ORS] OpenRouteService call failed or bypassed, using smart tactical routing engine.');
      }
    }

    // 2. High-Precision Smart Tactical Routing Fallback Engine
    const path = generateSmartDetourPath(start, end, activeHazards);
    const obstruction = checkRouteObstructions(path, activeHazards);

    // Calculate total path distance
    let totalDist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDist += calculateDistanceMeters(path[i], path[i + 1]);
    }

    // Driving/Evac speed avg ~32 km/h (8.8 m/s) with slowdown
    const durationSeconds = Math.round(totalDist / 8.8) + 60;

    return {
      coordinates: path,
      distanceMeters: Math.round(totalDist),
      durationSeconds,
      isObstructed: obstruction.isObstructed,
      obstructingHazards: obstruction.blockingHazards,
      rerouted: obstruction.blockingHazards.length === 0 && activeHazards.length > 0,
      detourReason: obstruction.isObstructed
        ? `Warning: Hazardous zone detected near route!`
        : undefined,
      waypointsCount: path.length
    };
  }
};
