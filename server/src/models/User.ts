import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'citizen' | 'authority' | 'shelter_admin';
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone?: string;
  organization?: string;
  assignedShelterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'authority', 'shelter_admin'], 
    default: 'citizen',
    index: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [72.8777, 19.0760] } // [lng, lat]
  },
  phone: { type: String },
  organization: { type: String },
  assignedShelterId: { type: String }
}, {
  timestamps: true
});

UserSchema.index({ location: '2dsphere' });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
