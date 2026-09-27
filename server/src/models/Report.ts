import mongoose, { Schema, Document } from 'mongoose';

export type ReportType = 'hazard' | 'need';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'active' | 'investigating' | 'dispatched' | 'resolved';

export interface IReport extends Document {
  type: ReportType;
  hazardCategory: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  severity: SeverityLevel;
  impactRadiusMeters: number;
  status: ReportStatus;
  photoUrl: string;
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  verified: boolean;
  dispatchNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  type: { type: String, enum: ['hazard', 'need'], required: true, index: true },
  hazardCategory: { type: String, default: 'other', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  address: { type: String, default: '' },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium',
    index: true
  },
  impactRadiusMeters: { type: Number, default: 150 },
  status: { 
    type: String, 
    enum: ['active', 'investigating', 'dispatched', 'resolved'], 
    default: 'active',
    index: true 
  },
  photoUrl: { type: String, default: '' },
  reportedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'citizen' }
  },
  verified: { type: Boolean, default: false },
  dispatchNotes: { type: String, default: '' }
}, {
  timestamps: true
});

ReportSchema.index({ location: '2dsphere' });

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
