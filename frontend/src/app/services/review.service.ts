import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  // ✅ Add a Review
  addReview(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  // ✅ Get Reviews for a User
  getUserReviews(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // ✅ Get Reviews for an Apartment
  getApartmentReviews(apartmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/apartment/${apartmentId}`);
  }

  // ✅ Delete a Review
  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}
