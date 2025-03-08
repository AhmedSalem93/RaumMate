import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../../modules/property/property.model';
import { environment } from '../../../environments/environment';

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

  getListings(): Observable<Property[]> {
    // Adjust endpoint URL as needed
    let httpParams = new HttpHeaders().set('Accept', '*/*');

    return this.http.get<Property[]>(environment.apiUrl + '/properties', {
      headers: httpParams,
    });
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
}
