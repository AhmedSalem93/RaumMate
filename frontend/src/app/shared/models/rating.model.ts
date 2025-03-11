import { Property } from './property.model';
import { User } from './user.model';

export interface Rating {
  property: string | Property; // Reference to Property
  user: string | User; // Reference to User
  rating: number; // Value between 1 and 5
  comment?: string; // Optional comment
  createdAt?: Date; // Creation date
}
