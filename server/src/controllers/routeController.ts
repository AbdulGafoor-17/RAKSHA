import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { routingService } from '../services/routingService.js';

export const routeController = {
  async calculateEvacuationRoute(req: Request, res: Response) {
    try {
      const { start, end, shelterId } = req.body;

      if (!start || !Array.isArray(start) || start.length !== 2) {
        return res.status(400).json({ error: 'Start coordinate [longitude, latitude] is required.' });
      }

      let destination: [number, number];

      // If shelterId is provided, get that shelter's coordinate
      if (shelterId) {
        const shelter = await dbStore.getShelterById(shelterId);
        if (!shelter) {
          return res.status(404).json({ error: 'Specified destination shelter not found.' });
        }
        destination = shelter.location.coordinates;
      } else if (end && Array.isArray(end) && end.length === 2) {
        destination = [parseFloat(end[0]), parseFloat(end[1])];
      } else {
        // Find nearest open shelter
        const nearestShelters = await dbStore.getNearestShelters(start[0], start[1]);
        if (!nearestShelters || nearestShelters.length === 0) {
          return res.status(404).json({ error: 'No open shelters found in the regional zone.' });
        }
        destination = nearestShelters[0].location.coordinates;
      }

      // Fetch active hazards to calculate avoidance
      const activeHazards = await dbStore.getActiveHazards();

      const routeResult = await routingService.calculateEvacuationRoute(
        [parseFloat(start[0]), parseFloat(start[1])],
        destination,
        activeHazards
      );

      return res.json({
        ...routeResult,
        destination,
        activeHazardsConsidered: activeHazards.length
      });
    } catch (err: any) {
      console.error('Error calculating route:', err);
      return res.status(500).json({ error: 'Failed to calculate evacuation path.' });
    }
  }
};
