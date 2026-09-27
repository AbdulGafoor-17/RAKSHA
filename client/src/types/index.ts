export type UserRole = 'citizen' | 'authority' | 'shelter_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export type ReportType = 'hazard' | 'need';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'active' | 'investigating' | 'dispatched' | 'resolved';

export interface Report {
  _id?: string;
  id: string;
  type: ReportType;
  hazardCategory: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
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
  createdAt: string;
  updatedAt?: string;
}

export type SupplyLevel = 'ample' | 'moderate' | 'critical' | 'depleted';
export type PowerStatus = 'operational' | 'generator' | 'critical' | 'offline';

export interface Shelter {
  _id?: string;
  id: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
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
  distanceMeters?: number;
}

export interface RouteData {
  coordinates: [number, number][]; // [lng, lat]
  distanceMeters: number;
  durationSeconds: number;
  isObstructed: boolean;
  obstructingHazards?: any[];
  rerouted?: boolean;
  detourReason?: string;
  destination: [number, number];
  shelter?: Shelter;
}
