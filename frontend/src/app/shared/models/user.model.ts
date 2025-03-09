// src/app/shared/models/user.model.ts
export interface User {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'guest' | 'registered' | 'verified' | 'propertyOwner' | 'admin';
    isVerified: boolean;
    profilePicture?: string;
    preferences?: Map<string, string>;
    createdAt?: Date;
  }