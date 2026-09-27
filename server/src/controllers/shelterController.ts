import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { broadcastShelterUpdate } from '../services/socketService.js';

export const shelterController = {
  async getAllShelters(req: Request, res: Response) {
    try {
      const shelters = await dbStore.getAllShelters();
      return res.json(shelters);
    } catch (err: any) {
      console.error('Error fetching shelters:', err);
      return res.status(500).json({ error: 'Failed to retrieve shelters.' });
    }
  },

  async getNearestShelters(req: Request, res: Response) {
    try {
      const { lng, lat, maxDistance } = req.query;
      if (!lng || !lat) {
        return res.status(400).json({ error: 'Longitude and latitude are required.' });
      }

      const longitude = parseFloat(lng as string);
      const latitude = parseFloat(lat as string);
      const maxDist = maxDistance ? parseInt(maxDistance as string, 10) : 30000;

      const shelters = await dbStore.getNearestShelters(longitude, latitude, maxDist);
      return res.json(shelters);
    } catch (err: any) {
      console.error('Error finding nearest shelters:', err);
      return res.status(500).json({ error: 'Failed to find nearest shelters.' });
    }
  },

  async getShelterById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const shelter = await dbStore.getShelterById(id);
      if (!shelter) {
        return res.status(404).json({ error: 'Shelter not found.' });
      }
      return res.json(shelter);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve shelter.' });
    }
  },

  async updateCapacity(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { capacityAvailable, capacityTotal, activeEvacueesCount, isOpen } = req.body;

      const updates: any = {};
      if (typeof capacityAvailable === 'number') updates.capacityAvailable = capacityAvailable;
      if (typeof capacityTotal === 'number') updates.capacityTotal = capacityTotal;
      if (typeof activeEvacueesCount === 'number') updates.activeEvacueesCount = activeEvacueesCount;
      if (typeof isOpen === 'boolean') updates.isOpen = isOpen;

      const updated = await dbStore.updateShelter(id, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Shelter not found.' });
      }

      broadcastShelterUpdate(updated);
      return res.json(updated);
    } catch (err: any) {
      console.error('Error updating capacity:', err);
      return res.status(500).json({ error: 'Failed to update shelter capacity.' });
    }
  },

  async updateSupplies(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { suppliesStatus } = req.body;

      if (!suppliesStatus) {
        return res.status(400).json({ error: 'Supplies status is required.' });
      }

      const updated = await dbStore.updateShelter(id, { suppliesStatus });
      if (!updated) {
        return res.status(404).json({ error: 'Shelter not found.' });
      }

      broadcastShelterUpdate(updated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update supplies status.' });
    }
  }
};
