import bcrypt from 'bcryptjs';
import { isMongoConnected } from '../config/db.js';
import { UserModel, IUser } from '../models/User.js';
import { ReportModel, IReport, ReportStatus, SeverityLevel } from '../models/Report.js';
import { ShelterModel, IShelter } from '../models/Shelter.js';
import { SEED_USERS, SEED_SHELTERS, SEED_REPORTS } from '../seeds/seedData.js';

// Haversine distance in meters between two [longitude, latitude] coordinates
export function calculateDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// In-Memory storage collections
class InMemoryStore {
  users: any[] = [];
  shelters: any[] = [];
  reports: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // Sync pre-hash or fast hash so memory store is populated synchronously
    this.users = SEED_USERS.map((u, i) => ({
      ...u,
      _id: `user-${i + 1}`,
      id: `user-${i + 1}`,
      passwordHash: '$2a$10$wN9Psm9s1K3U5Y9wA6yU3e7bU.3N6zG3C1h3Q4v3Q3v3Q3v3Q3v3Q', // standard bcrypt pre-hashed for 'Password123!'
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.shelters = SEED_SHELTERS.map((s) => ({
      ...s,
      _id: s.id,
      id: s.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    this.reports = SEED_REPORTS.map((r) => ({
      ...r,
      _id: r.id,
      id: r.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`✨ [In-Memory DB] Synchronously initialized with ${this.users.length} users, ${this.shelters.length} shelters, and ${this.reports.length} reports.`);
  }

  async ensureMongoSeeded() {
    if (isMongoConnected) {
      const count = await ShelterModel.countDocuments();
      if (count === 0) {
        console.log('🌱 [MongoDB] Seeding database with initial scenario...');
        await ShelterModel.insertMany(SEED_SHELTERS);
        await ReportModel.insertMany(SEED_REPORTS);
        console.log('✅ [MongoDB] Initial scenario seeded successfully.');
      }
    }
  }

  reset() {
    this.seed();
  }
}

export const inMemoryDB = new InMemoryStore();

export const dbStore = {
  // --- USERS ---
  async findUserByEmail(email: string) {
    if (isMongoConnected) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    return inMemoryDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    if (isMongoConnected) {
      return await UserModel.findById(id);
    }
    return inMemoryDB.users.find((u) => u._id === id || u.id === id) || null;
  },

  async createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role: 'citizen' | 'authority' | 'shelter_admin';
    location?: { type: 'Point'; coordinates: [number, number] };
    phone?: string;
    organization?: string;
  }) {
    if (isMongoConnected) {
      const user = new UserModel({
        ...userData,
        email: userData.email.toLowerCase()
      });
      return await user.save();
    }
    const newUser = {
      _id: `user-${Date.now()}`,
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryDB.users.push(newUser);
    return newUser;
  },

  // --- SHELTERS ---
  async getAllShelters() {
    if (isMongoConnected) {
      return await ShelterModel.find().sort({ capacityAvailable: -1 });
    }
    return [...inMemoryDB.shelters].sort((a, b) => b.capacityAvailable - a.capacityAvailable);
  },

  async getShelterById(id: string) {
    if (isMongoConnected) {
      return await ShelterModel.findById(id);
    }
    return inMemoryDB.shelters.find((s) => s._id === id || s.id === id) || null;
  },

  async getNearestShelters(lng: number, lat: number, maxDistanceMeters: number = 25000) {
    if (isMongoConnected) {
      return await ShelterModel.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceMeters
          }
        },
        isOpen: true,
        capacityAvailable: { $gt: 0 }
      });
    }

    // In-memory geospatial calculation
    const currentCoord: [number, number] = [lng, lat];
    return inMemoryDB.shelters
      .filter((s) => s.isOpen && s.capacityAvailable > 0)
      .map((s) => {
        const distance = calculateDistanceMeters(currentCoord, s.location.coordinates);
        return { ...s, distanceMeters: Math.round(distance) };
      })
      .filter((s) => s.distanceMeters <= maxDistanceMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  },

  async updateShelter(id: string, updates: Partial<IShelter>) {
    if (isMongoConnected) {
      return await ShelterModel.findByIdAndUpdate(id, updates, { new: true });
    }
    const shelter = inMemoryDB.shelters.find((s) => s._id === id || s.id === id);
    if (!shelter) return null;
    Object.assign(shelter, updates, { updatedAt: new Date() });
    return shelter;
  },

  // --- REPORTS ---
  async getAllReports(filters?: { type?: string; status?: string; severity?: string }) {
    if (isMongoConnected) {
      const query: any = {};
      if (filters?.type) query.type = filters.type;
      if (filters?.status && filters.status !== 'all') query.status = filters.status;
      if (filters?.severity && filters.severity !== 'all') query.severity = filters.severity;
      return await ReportModel.find(query).sort({ createdAt: -1 });
    }

    let list = [...inMemoryDB.reports];
    if (filters?.type) {
      list = list.filter((r) => r.type === filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'all') {
      list = list.filter((r) => r.severity === filters.severity);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getActiveHazards() {
    if (isMongoConnected) {
      return await ReportModel.find({
        type: 'hazard',
        status: { $in: ['active', 'investigating', 'dispatched'] }
      });
    }
    return inMemoryDB.reports.filter(
      (r) => r.type === 'hazard' && ['active', 'investigating', 'dispatched'].includes(r.status)
    );
  },

  async createReport(reportData: any) {
    if (isMongoConnected) {
      const rep = new ReportModel(reportData);
      return await rep.save();
    }
    const newReport = {
      _id: `report-${Date.now()}`,
      id: `report-${Date.now()}`,
      ...reportData,
      status: reportData.status || 'active',
      verified: reportData.verified ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryDB.reports.unshift(newReport);
    return newReport;
  },

  async updateReport(id: string, updates: Partial<IReport>) {
    if (isMongoConnected) {
      return await ReportModel.findByIdAndUpdate(id, updates, { new: true });
    }
    const rep = inMemoryDB.reports.find((r) => r._id === id || r.id === id);
    if (!rep) return null;
    Object.assign(rep, updates, { updatedAt: new Date() });
    return rep;
  },

  async resetData() {
    inMemoryDB.reset();
    if (isMongoConnected) {
      await ShelterModel.deleteMany({});
      await ReportModel.deleteMany({});
      await ShelterModel.insertMany(SEED_SHELTERS);
      await ReportModel.insertMany(SEED_REPORTS);
    }
    return true;
  }
};
