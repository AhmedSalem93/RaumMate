import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Booking,
  BookingRequest,
  BookingStatus,
  StatusUpdateRequest,
} from '../../shared/models/booking.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders().set('Accept', '*/*');

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Create a new booking request
   */
  createBooking(
    bookingRequest: BookingRequest
  ): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(
      this.apiUrl,
      bookingRequest,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Get all bookings for the logged-in user
   * @param role - 'owner' to get bookings where user is the owner, otherwise gets bookings where user is the requester
   */
  getBookings(role?: 'owner' | 'requester'): Observable<Booking[]> {
    if (!role) {
      role = 'requester';
    }
    const params = { role };
    return this.http.get<Booking[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: params,
    });
  }

  /**
   * Get a specific booking by ID
   */
  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Update booking status (accept, reject, cancel)
   */
  updateBookingStatus(
    id: string,
    statusUpdate: StatusUpdateRequest
  ): Observable<{ message: string; booking: Booking }> {
    return this.http.patch<{ message: string; booking: Booking }>(
      `${this.apiUrl}/${id}/status`,
      statusUpdate,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Helper method to cancel a booking (for requesters)
   */
  cancelBooking(id: string): Observable<{ message: string; booking: Booking }> {
    return this.updateBookingStatus(id, { status: 'cancelled' });
  }

  /**
   * Helper method for owners to accept a booking
   */
  acceptBooking(
    id: string,
    notes?: string
  ): Observable<{ message: string; booking: Booking }> {
    return this.updateBookingStatus(id, {
      status: 'accepted',
      ownerNotes: notes,
    });
  }

  /**
   * Helper method for owners to reject a booking
   */
  rejectBooking(
    id: string,
    notes?: string
  ): Observable<{ message: string; booking: Booking }> {
    return this.updateBookingStatus(id, {
      status: 'rejected',
      ownerNotes: notes,
    });
  }
}
