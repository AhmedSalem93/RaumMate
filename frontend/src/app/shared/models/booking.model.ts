import { Property } from './property.model';
import { User } from './user.model';

export type BookingStatus =
  | 'requested'
  | 'in_progress'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export interface Booking {
  _id: string;
  viewingDate: Date | string;
  status: BookingStatus;
  message: string;
  ownerNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  property?: string | Property; // id or object
  requestedBy?: string | User; // id or object
  owner?: string | User; // id or object
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
