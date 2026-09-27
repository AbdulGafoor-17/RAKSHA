import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import { notifyNewHazardAndCheckRoutes, broadcastReportUpdate } from '../services/socketService.js';

export const reportController = {
  async getAllReports(req: Request, res: Response) {
    try {
      const { type, status, severity } = req.query;
      const reports = await dbStore.getAllReports({
        type: type as string,
        status: status as string,
        severity: severity as string
      });
      return res.json(reports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({ error: 'Failed to retrieve incident reports.' });
    }
  },

  async createReport(req: Request, res: Response) {
    try {
      const {
        type,
        hazardCategory,
        title,
        description,
        coordinates, // [lng, lat]
        address,
        severity,
        impactRadiusMeters,
        photoUrl,
        reportedBy
      } = req.body;

      if (!title || !coordinates || !coordinates.length) {
        return res.status(400).json({ error: 'Title and coordinates are required.' });
      }

      const report = await dbStore.createReport({
        type: type || 'hazard',
        hazardCategory: hazardCategory || 'other',
        title,
        description: description || '',
        location: {
          type: 'Point',
          coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
        },
        address: address || 'Reported Location',
        severity: severity || 'medium',
        impactRadiusMeters: impactRadiusMeters ? parseInt(impactRadiusMeters, 10) : (type === 'hazard' ? 180 : 50),
        status: 'active',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        reportedBy: reportedBy || { id: 'citizen-anon', name: 'Citizen Reporter', role: 'citizen' },
        verified: reportedBy?.role === 'authority'
      });

      // If it's a hazard, immediately trigger dynamic route scanning & socket notification!
      if (report.type === 'hazard') {
        notifyNewHazardAndCheckRoutes(report);
      } else {
        broadcastReportUpdate(report);
      }

      return res.status(201).json(report);
    } catch (err: any) {
      console.error('Error creating report:', err);
      return res.status(500).json({ error: 'Failed to submit report.' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, dispatchNotes } = req.body;

      if (!['active', 'investigating', 'dispatched', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
      }

      const updated = await dbStore.updateReport(id, {
        status,
        dispatchNotes: dispatchNotes || undefined,
        verified: status === 'dispatched' || status === 'resolved' ? true : undefined
      });

      if (!updated) {
        return res.status(404).json({ error: 'Report not found.' });
      }

      broadcastReportUpdate(updated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update report status.' });
    }
  }
};
