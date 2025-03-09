// src/app/shared/models/property.model.ts
export interface Property {
    id?: string;
    title: string;
    description: string;
    ownerId: string;
    location: {
      city: string;
      address?: string;
      coordinates?: {
        lat: number;
        lng: number;
      }
    };
    price: number;
    isAvailable: boolean;
    isSublet?: boolean;
    subletDates?: {
      start: Date;
      end: Date;
    };
    amenities: string[];
    images: string[];
    createdAt?: Date;
  }