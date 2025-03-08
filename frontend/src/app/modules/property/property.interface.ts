export interface Property {
  _id?: string; // if you get the property after creation, it will have an _id
  title: string;
  description: string;
  owner: string; // This is the ObjectId string (ref to User)
  location: {
    city: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  isAvailable: boolean;
  isSublet: boolean;
  subletDates?: {
    start: string; // Dates are usually strings when coming from REST APIs (ISO 8601)
    end: string;
  };
  amenities: string[];
  mediaPaths: string[];
  createdAt?: string; // Date as string from backend
}
