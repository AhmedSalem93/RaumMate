import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rating } from '../../shared/models/rating.model';
import { tap, catchError, of } from 'rxjs';

export interface RatingPaginatedResponse {
  ratings: Rating[];
  summary?: {
    averageRating: number;
    count: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRatings: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RatingStatsResponse {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface MyRatingResponse {
  hasRated: boolean;
  message?: string;
  rating?: Rating;
}

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Accept', '*/*');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Add a rating to a property
  addRating(
    propertyId: string,
    rating: number,
    comment?: string
  ): Observable<Rating> {
    return this.http.post<Rating>(
      `${environment.apiUrl}/ratings/${propertyId}`,
      { rating, comment },
      { headers: this.getHeaders() }
    );
  }

  // Get all ratings for a property with pagination
  getPropertyRatings(
    propertyId: string,
    page = 1,
    limit = 10
  ): Observable<RatingPaginatedResponse> {
    return this.http.get<RatingPaginatedResponse>(
      `${environment.apiUrl}/ratings/${propertyId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Get all ratings by a user
  getUserRatings(
    userId?: string,
    page = 1,
    limit = 10
  ): Observable<RatingPaginatedResponse> {
    // if userId is not provided, It will return the ratings of the authenticated user
    return this.http.get<RatingPaginatedResponse>(
      `${environment.apiUrl}/ratings/user/${userId}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }
  getMyRatingsOnProp(propertyId: string): Observable<MyRatingResponse> {
    console.log(`Fetching my ratings for property: ${propertyId}`);
    return this.http
      .get<MyRatingResponse>(
        `${environment.apiUrl}/ratings/myratings/${propertyId}`,
        { headers: this.getHeaders() }
      )
      .pipe(
        tap((response) => console.log('My ratings response:', response)),
        catchError((error) => {
          console.error('Error fetching my ratings:', error);
          // Return a default response in case of error
          return of({
            hasRated: false,
            message: 'Error fetching rating',
          });
        })
      );
  }
  // Delete a rating
  deleteRating(ratingId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/ratings/${ratingId}`,
      { headers: this.getHeaders() }
    );
  }

  // Get rating stats by property
  getRatingStats(propertyId: string): Observable<RatingStatsResponse> {
    return this.http.get<RatingStatsResponse>(
      `${environment.apiUrl}/ratings/stats/${propertyId}`,
      { headers: this.getHeaders() }
    );
  }
}
