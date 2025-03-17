import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property } from '../../shared/models/property.model';

type PaginationReturnType = {
  pagination: { total: number; limit: number; page: number };
  properties: Property[];
};

export interface SearchParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  isSublet?: boolean;
  amenities?: string[];
  subletStartDate?: string;
  subletEndDate?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private http = inject(HttpClient);
  constructor() {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Accept', '*/*');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  createListing(formData: FormData): Observable<any> {
    return this.http.post(environment.apiUrl + '/properties/', formData, {
      headers: this.getHeaders(),
    });
  }

  getListings(): Observable<PaginationReturnType> {
    return this.http.get<PaginationReturnType>(
      environment.apiUrl + '/properties',
      {
        headers: this.getHeaders(),
      }
    );
  }

  searchListings(query: string): Observable<any[]> {
    // Adjust endpoint URL as needed
    return this.http.get<any[]>(`/api/listings?query=${query}`, {
      headers: this.getHeaders(),
    });
  }

  getListingById(id: string): Observable<Property> {
    // Updated endpoint URL to use environment variable and correct path
    return this.http.get<Property>(`${environment.apiUrl}/properties/${id}`, {
      headers: this.getHeaders(),
    });
  }

  updateListing(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/properties/${id}`, formData, {
      headers: this.getHeaders(),
    });
  }

  searchProperties(params: SearchParams): Observable<PaginationReturnType> {
    // Only include parameters that have actual values
    const queryParams = new URLSearchParams();

    // Helper function to add a parameter only if it has a valid value
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.set(key, String(value));
      }
    };

    // Add pagination parameters
    addParam('page', params.page);
    addParam('limit', params.limit);

    // Add search filters
    addParam('city', params.city);
    addParam('minPrice', params.minPrice);
    addParam('maxPrice', params.maxPrice);
    addParam('isSublet', params.isSublet);

    // Handle dates
    addParam('subletStartDate', params.subletStartDate);
    addParam('subletEndDate', params.subletEndDate);

    // Handle sorting
    if (params.sortBy) {
      const [field, order] = params.sortBy.split('_');
      addParam('sortBy', field);
      addParam('sortOrder', order);
    }

    // Handle arrays (like amenities)
    if (
      params.amenities &&
      Array.isArray(params.amenities) &&
      params.amenities.length > 0
    ) {
      params.amenities.forEach((amenity) => {
        queryParams.append('amenities', amenity);
      });
    }

    return this.http.get<PaginationReturnType>(
      `${environment.apiUrl}/properties?${queryParams.toString()}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getAmenities(): Observable<string[]> {
    return this.http.get<string[]>(
      `${environment.apiUrl}/properties/amenities`,
      {
        headers: this.getHeaders(),
      }
    );
  }
  // show or not
  toggleAvailability(id: string): Observable<boolean> {
    return this.http.patch<boolean>(
      `${environment.apiUrl}/properties/${id}/availability`,
      {}, // Empty body, but needed as second parameter
      {
        headers: this.getHeaders(),
      }
    );
  }
}
