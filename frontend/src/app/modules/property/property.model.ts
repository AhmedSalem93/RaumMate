export interface Property {
  _id?: string; // if you get the property after creation, it will have an _id
  title: string;
  description: string;
  owner: string | Object; // This is the ObjectId string (ref to User) or the User object
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
  reviews: {
    averageRating: number; // 1-5
    count: number; // Number of reviews
  };
  amenities: string[];
  mediaPaths: string[];
  createdAt?: string; // Date as string from backend
}
