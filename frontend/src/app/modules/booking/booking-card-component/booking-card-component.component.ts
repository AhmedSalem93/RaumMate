import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Add MatDialogModule
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Booking, BookingStatus } from '../../../shared/models/booking.model';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';
import {
  BookingResponseDialogComponent,
  BookingResponseDialogData,
} from '../booking-response-dialog/booking-response-dialog.component';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-booking-card-component',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule, // Add this import
    DatePipe,
    NgIf,
    NgClass,
    RouterLink,
  ],
  templateUrl: './booking-card-component.component.html',
  styleUrl: './booking-card-component.component.scss',
})
export class BookingCardComponentComponent implements OnInit {
  @Input() booking!: Booking;
  @Input() userId: string = '';

  // Add output events for notifying parent component
  @Output() bookingUpdated = new EventEmitter<{
    action: string;
    booking: Booking;
  }>();
  @Output() actionError = new EventEmitter<{ action: string; error: any }>();

  propertyImageFallback = 'https://placehold.co/400x200';

  constructor(
    private dialog: MatDialog,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    // Log values for debugging when component initializes
    console.log('Booking Card Component initialized with:', {
      bookingId: this.booking._id,
      status: this.booking.status,
      userId: this.userId,
      owner: this.booking.owner,
      requestedBy: this.booking.requestedBy,
      isOwner: this.isOwner(),
      isRequester: this.isRequester(),
    });
  }

  /**
   * Determine if the current user is the property owner
   */
  isOwner(): boolean {
    if (!this.userId || !this.booking || !this.booking.owner) {
      return false;
    }

    const ownerId =
      typeof this.booking.owner === 'string'
        ? this.booking.owner
        : (this.booking.owner as User)._id;

    const result = ownerId === this.userId;
    return result;
  }

  /**
   * Determine if the current user is the booking requester
   */
  isRequester(): boolean {
    if (!this.userId || !this.booking || !this.booking.requestedBy) {
      return false;
    }

    const requesterId =
      typeof this.booking.requestedBy === 'string'
        ? this.booking.requestedBy
        : (this.booking.requestedBy as User)._id;

    const result = requesterId === this.userId;
    return result;
  }

  getStatusClass(): string {
    switch (this.booking.status) {
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'cancelled':
        return 'status-cancelled';
      case 'in_progress':
        return 'status-in-progress';
      default:
        return 'status-requested';
    }
  }

  getStatusText(): string {
    // Convert status from snake_case to Title Case for display
    if (this.booking.status === 'in_progress') {
      return 'In Progress';
    }
    return (
      this.booking.status.charAt(0).toUpperCase() + this.booking.status.slice(1)
    );
  }

  /**
   * Check if the booking can be accepted or rejected
   * (Only 'requested' bookings can be accepted or rejected)
   */
  canProcessBooking(): boolean {
    return this.booking.status === 'requested';
  }

  /**
   * Check if the booking can be cancelled
   * (Only 'requested' or 'in_progress' bookings can be cancelled)
   */
  canCancelBooking(): boolean {
    return ['requested', 'in_progress'].includes(this.booking.status);
  }

  getPropertyTitle(): string {
    if (this.booking.property && typeof this.booking.property !== 'string') {
      return (this.booking.property as Property).title;
    }
    return 'Property details not available';
  }

  isImgUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|tif|svg|heif|heic)$/i.test(
      url
    );
  }
  getPropertyImage(): string {
    if (this.booking.property && typeof this.booking.property !== 'string') {
      // return first image url
      for (const mediaPath of (this.booking.property as Property).mediaPaths) {
        if (this.isImgUrl(mediaPath)) {
          return `${environment.apiUrl}${mediaPath}`;
        }
      }
    }
    return this.propertyImageFallback;
  }

  getRequesterName(): string {
    if (
      this.booking.requestedBy &&
      typeof this.booking.requestedBy !== 'string'
    ) {
      const user = this.booking.requestedBy as User;
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Unknown User';
  }

  getOwnerName(): string {
    if (this.booking.owner && typeof this.booking.owner !== 'string') {
      const owner = this.booking.owner as User;
      return `${owner.firstName} ${owner.lastName}`;
    }
    return 'Property Owner';
  }

  getPropertyLocation(): string {
    if (this.booking.property && typeof this.booking.property !== 'string') {
      const property = this.booking.property as Property;
      return property.location.city;
    }
    return 'Location not available';
  }
  getPropImageURL(name: string) {
    return `${environment.apiUrl}${name}`;
  }
  /**
   * Safely get the property ID for routing
   */
  getPropertyId(): string {
    if (this.booking.property && typeof this.booking.property !== 'string') {
      return (this.booking.property as Property)._id!;
    }

    // If booking.property is a string, it might be the ID itself
    if (typeof this.booking.property === 'string') {
      return this.booking.property;
    }

    return '';
  }

  onAccept(): void {
    try {
      const bookingId = this.booking._id;

      if (!bookingId) {
        console.error('Missing booking ID for accept action');
        return;
      }

      const dialogData: BookingResponseDialogData = {
        action: 'accept',
        bookingId: bookingId,
        propertyTitle: this.getPropertyTitle(),
      };

      console.log('Opening accept dialog with data:', dialogData);

      const dialogRef = this.dialog.open(BookingResponseDialogComponent, {
        width: '450px',
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialog result:', result);
        if (result && result.confirmed) {
          console.log('Processing accept action with data:', {
            id: result.bookingId,
            notes: result.notes,
          });

          // Call the booking service directly
          this.bookingService
            .acceptBooking(result.bookingId, result.notes)
            .subscribe({
              next: (response) => {
                console.log('Booking accepted successfully:', response);
                this.bookingUpdated.emit({
                  action: 'accept',
                  booking: response.booking,
                });
              },
              error: (error) => {
                console.error('Error accepting booking', error);
                this.actionError.emit({ action: 'accept', error });
              },
            });
        }
      });
    } catch (error) {
      console.error('Error in onAccept method:', error);
      this.actionError.emit({ action: 'accept', error });
    }
  }

  onReject(): void {
    const dialogData: BookingResponseDialogData = {
      action: 'reject',
      bookingId: this.booking._id,
      propertyTitle: this.getPropertyTitle(),
    };

    const dialogRef = this.dialog.open(BookingResponseDialogComponent, {
      width: '450px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.confirmed) {
        this.bookingService
          .rejectBooking(result.bookingId, result.notes)
          .subscribe({
            next: (response) => {
              console.log('Booking rejected successfully:', response);
              this.bookingUpdated.emit({
                action: 'reject',
                booking: response.booking,
              });
            },
            error: (error) => {
              console.error('Error rejecting booking', error);
              this.actionError.emit({ action: 'reject', error });
            },
          });
      }
    });
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel this booking request?')) {
      this.bookingService.cancelBooking(this.booking._id).subscribe({
        next: (response) => {
          console.log('Booking cancelled successfully:', response);
          this.bookingUpdated.emit({
            action: 'cancel',
            booking: response.booking,
          });
        },
        error: (error) => {
          console.error('Error cancelling booking', error);
          this.actionError.emit({ action: 'cancel', error });
        },
      });
    }
  }
}
