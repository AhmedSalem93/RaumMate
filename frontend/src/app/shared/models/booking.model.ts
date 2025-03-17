import { Property } from './property.model';
import { User } from './user.model';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Booking {
  _id: string;
  propertyId: string;
  requesterId: string;
  ownerId: string;
  startDate: Date | string;
  endDate: Date | string;
  status: BookingStatus;
  message: string;
  ownerNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  property?: any; // Optional property object if populated
  requester?: any; // Optional requester object if populated
  owner?: any; // Optional owner object if populated
}

export interface BookingRequest {
  propertyId: string;
  viewingDate: Date | string;
  message: string;
}

export interface StatusUpdateRequest {
  status: BookingStatus;
  ownerNotes?: string;
}
