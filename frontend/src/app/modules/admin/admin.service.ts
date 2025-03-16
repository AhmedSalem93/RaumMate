import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // User Management
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  // Property Management
  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/properties`);
  }

  verifyProperty(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}/verify`, {});
  }

  rejectProperty(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/properties/${id}/reject`, {});
  }

  // Review Management
  getReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reviews`);
  }

  approveReview(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${id}/approve`, {});
  }

  rejectReview(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${id}/reject`, {});
  }

  // System Metrics
  getSystemMetrics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/metrics`);
  }
}
