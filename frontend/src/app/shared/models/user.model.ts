// src/app/shared/models/user.model.ts
export interface User {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Adding password, but as optional for frontend use
  dateofBirth?: Date;
  city?: string;
  country?: string;
  postalCode?: string;
  address?: string;
  role: 'guest' | 'registered' | 'verified' | 'propertyOwner' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  profileCompleted?: boolean;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  preferences?: Map<string, string>;
  interests?: Map<string, string>;
  createdAt?: Date;
}
