import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'client' | 'service_provider' | 'admin';
  phoneNumber?: string;
  createdAt: Date;
}

export interface Incident {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: string;
  issueType: 'towing' | 'breakdown' | 'flat_tire' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedProviderId?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  companyName: string;
  serviceArea: string[];
  vehicleTypes: string[];
  contactNumber: string;
  availabilityStatus: 'available' | 'busy' | 'offline';
  rating?: number;
  createdAt: Date;
}

// Utility types for Firestore operations
export type CollectionName = 'users' | 'incidents' | 'service_providers';