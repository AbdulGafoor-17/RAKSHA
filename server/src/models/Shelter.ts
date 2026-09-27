import mongoose, { Schema, Document } from 'mongoose';

export type SupplyLevel = 'ample' | 'moderate' | 'critical' | 'depleted';
export type PowerStatus = 'operational' | 'generator' | 'critical' | 'offline';

export interface IShelter extends Document {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  capacityTotal: number;
  capacityAvailable: number;
  suppliesStatus: {
    medical: SupplyLevel;
    food: SupplyLevel;
    water: SupplyLevel;
    power: PowerStatus;
    bedding: SupplyLevel;
  };
  contactInfo: {
    phone: string;
    email: string;
    managerName: string;
  };
  isOpen: boolean;
  tags: string[];
  activeEvacueesCount: number;
  adminUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShelterSchema = new Schema<IShelter>({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  address: { type: String, required: true },
  capacityTotal: { type: Number, required: true, default: 200 },
  capacityAvailable: { type: Number, required: true, default: 150 },
  suppliesStatus: {
    medical: { type: String, enum: ['ample', 'moderate', 'critical', 'depleted'], default: 'ample' },
    food: { type: String, enum: ['ample', 'moderate', 'critical', 'depleted'], default: 'ample' },
    water: { type: String, enum: ['ample', 'moderate', 'critical', 'depleted'], default: 'ample' },
    power: { type: String, enum: ['operational', 'generator', 'critical', 'offline'], default: 'operational' },
    bedding: { type: String, enum: ['ample', 'moderate', 'critical', 'depleted'], default: 'ample' },
  },
  contactInfo: {
    phone: { type: String, default: '+1 (555) 019-2831' },
    email: { type: String, default: 'shelter-ops@raksha.org' },
    managerName: { type: String, default: 'Operations Lead' }
  },
  isOpen: { type: Boolean, default: true, index: true },
  tags: { type: [String], default: ['Wheelchair Accessible', 'Emergency Power', 'First Aid'] },
  activeEvacueesCount: { type: Number, default: 0 },
  adminUserId: { type: String }
}, {
  timestamps: true
});

ShelterSchema.index({ location: '2dsphere' });

export const ShelterModel = mongoose.models.Shelter || mongoose.model<IShelter>('Shelter', ShelterSchema);
