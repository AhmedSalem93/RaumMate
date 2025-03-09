import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../../modules/property/property.model';
import { environment } from '../../../environments/environment';

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

  createListing(formData: FormData): Observable<any> {
    formData.append('owner', '67cad68e71e43adb9e8b8c2e');
    let httpParams = new HttpHeaders().set('Accept', '*/*');

    return this.http.post(environment.apiUrl + '/properties/', formData, {
      headers: httpParams,
    });
  }

  getListings(): Observable<PaginationReturnType> {
    // Adjust endpoint URL as needed
    let httpParams = new HttpHeaders().set('Accept', '*/*');

    return this.http.get<PaginationReturnType>(
      environment.apiUrl + '/properties',
      {
        headers: httpParams,
      }
    );
  }

  searchListings(query: string): Observable<any[]> {
    // Adjust endpoint URL as needed
    return this.http.get<any[]>(`/api/listings?query=${query}`);
  }

  getListingById(id: string): Observable<any> {
    // Adjust endpoint URL as needed
    return this.http.get<any>(`/api/listings/${id}`);
  }

  updateListing(id: string, listing: Property): Observable<any> {
    // Adjust endpoint URL as needed
    return this.http.put(`/api/listings/${id}`, listing);
  }

  deleteListing(id: string): Observable<any> {
    // Adjust endpoint URL as needed
    return this.http.delete(`/api/listings/${id}`);
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
        headers: new HttpHeaders().set('Accept', '*/*'),
      }
    );
  }

  getAmenities(): Observable<string[]> {
    return this.http.get<string[]>(
      `${environment.apiUrl}/properties/amenities`,
      {
        headers: new HttpHeaders().set('Accept', '*/*'),
      }
    );
  }
}
