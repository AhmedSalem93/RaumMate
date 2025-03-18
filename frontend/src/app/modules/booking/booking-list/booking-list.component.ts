import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingCardComponentComponent } from '../booking-card-component/booking-card-component.component';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, catchError, finalize, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { BookingResponseDialogComponent } from '../booking-response-dialog/booking-response-dialog.component';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    BookingCardComponentComponent,
    MatTabsModule,
    MatDialogModule, // Add this import
    MatProgressSpinnerModule,
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent implements OnInit {
  myBookings: Booking[] = [];
  receivedBookings: Booking[] = [];
  loading = true;
  error = false;
  currentUserId: string = '';

  constructor(
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Fetch the current user ID immediately at component initialization
    this.userService.getProfile()?.subscribe({
      next: (user) => {
        if (user && user._id) {
          this.currentUserId = user._id;
          console.log('Current user ID:', this.currentUserId);
        } else {
          console.error('User profile does not contain an ID');
        }
        // Only load bookings after we have the user ID
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.error = true;
        this.loading = false;
      },
    });
  }

  loadBookings(): void {
    this.loading = true;
    this.error = false;

    if (!this.currentUserId) {
      console.error('No current user ID available when loading bookings');
      this.error = true;
      this.loading = false;
      return;
    }

    console.log('Loading bookings with user ID:', this.currentUserId);

    // Get bookings where user is the requester
    this.bookingService
      .getBookings('requester')
      .pipe(
        catchError((error) => {
          console.error('Error fetching my bookings', error);
          this.error = true;
          return of([]);
        })
      )
      .subscribe((bookings) => {
        this.myBookings = bookings;
        console.log('My bookings loaded:', bookings.length);

        // Log the first booking for debugging
        if (bookings.length > 0) {
          console.log('Sample my booking:', {
            id: bookings[0]._id,
            status: bookings[0].status,
            property:
              typeof bookings[0].property === 'string'
                ? 'ID Only'
                : 'Full Object',
            owner:
              typeof bookings[0].owner === 'string' ? 'ID Only' : 'Full Object',
            requestedBy:
              typeof bookings[0].requestedBy === 'string'
                ? 'ID Only'
                : 'Full Object',
          });
        }
      });

    // Get bookings where user is the owner
    this.bookingService
      .getBookings('owner')
      .pipe(
        catchError((error) => {
          console.error('Error fetching received bookings', error);
          this.error = true;
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((bookings) => {
        this.receivedBookings = bookings;
      });
  }

  handleBookingUpdated(event: { action: string; booking: Booking }): void {
    // Show appropriate notification
    let message = '';
    switch (event.action) {
      case 'accept':
        message = 'Booking accepted successfully';
        break;
      case 'reject':
        message = 'Booking rejected';
        break;
      case 'cancel':
        message = 'Booking cancelled';
        break;
      case 'contract_done':
        message = 'Booking marked as Contract Done';
        break;
    }

    this.snackBar.open(message, 'Close', { duration: 3000 });
    this.loadBookings(); // Reload to update the list
  }

  handleActionError(event: { action: string; error: any }): void {
    console.error(`Error ${event.action}ing booking`, event.error);
    this.snackBar.open(`Failed to ${event.action} booking`, 'Close', {
      duration: 3000,
    });
  }
}
