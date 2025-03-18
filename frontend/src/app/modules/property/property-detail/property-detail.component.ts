import { UserService } from './../../../core/services/user.service';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyRatingsComponent } from '../property-ratings/property-ratings.component';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewComponent } from '../../../shared/components/image-preview/image-preview.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { BookingDialogComponent } from '../../booking/booking-dialog/booking-dialog.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    PropertyRatingsComponent,
    GoogleMapsModule,
    RouterLink,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private propertyService = inject(PropertyService);
  private userService = inject(UserService);
  id = '';
  property: Property | null = null;
  owner: User | null = null;
  currentImageIndex = 0;
  isLoading = true;
  error: string | null = null;
  isAuthenticated = false;
  CurrentuserId = '';

  mapsOptions: google.maps.MapOptions = {
    center: { lat: 40, lng: -20 },
    zoom: 14,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: 'b1b1b1b1b1b1b1b1',
  };

  markerPosition: google.maps.LatLngLiteral = { lat: 40, lng: -20 };
  constructor(private readonly router: Router) {}
  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    // TODO - make isAuthenticated reactive to changes
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.fetchPropertyDetails();
    });

    // get my user id from profile
    this.userService.getProfile().subscribe((user) => {
      this.CurrentuserId = user._id!;
    });
  }

  get isOwner(): boolean {
    return this.owner?._id === this.CurrentuserId;
  }

  fetchPropertyDetails(): void {
    this.isLoading = true;

    this.propertyService.getListingById(this.id).subscribe({
      next: (data) => {
        console.log('Property data received:', data);
        this.property = data;
        // Handle owner information if it's populated
        if (typeof data.owner === 'object') {
          this.owner = data.owner as User;
        }
        console.log('Owner data:', this.owner);

        // Configure the Google Map with property location
        if (
          data.location?.coordinates?.lat &&
          data.location?.coordinates?.lng
        ) {
          const position = {
            lat: data.location.coordinates.lat,
            lng: data.location.coordinates.lng,
          };
          this.markerPosition = position;
          this.mapsOptions = {
            ...this.mapsOptions,
            center: position,
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching property details:', err);
        this.error = `Failed to load property details: ${
          err.message || 'Unknown error'
        }`;
        this.isLoading = false;
      },
    });
  }

  sendMessage(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']); // Redirect to login if not authenticated
      return;
    }
    if (this.owner && this.userService) {
      const sellerId = this.owner.id; // Owner of the property
      const buyerId = this.userService.user; // Current logged-in user

      // Navigate to the MessagesComponent with query parameters
      this.router.navigate(['/messages'], {
        queryParams: { sellerId, buyerId },
      });
    } else {
      console.error('Owner or current user information is missing.');
    }
  }

  nextImage(): void {
    if (
      this.property &&
      this.property.mediaPaths &&
      this.property.mediaPaths.length > 0
    ) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.property.mediaPaths.length;
    }
  }

  prevImage(): void {
    if (
      this.property &&
      this.property.mediaPaths &&
      this.property.mediaPaths.length > 0
    ) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.property.mediaPaths.length - 1
          : this.currentImageIndex - 1;
    }
  }

  getCurrentImage(): string {
    if (this.property?.mediaPaths && this.property.mediaPaths.length > 0) {
      return `${environment.apiUrl}${
        this.property.mediaPaths[this.currentImageIndex]
      }`;
    }
    return 'assets/images/placeholder-property.jpg'; // Fallback image
  }

  getMediaUrl(): string {
    if (this.property?.mediaPaths && this.property.mediaPaths.length > 0) {
      const url = `${environment.apiUrl}${
        this.property.mediaPaths[this.currentImageIndex]
      }`;
      return url;
    }
    return 'assets/images/placeholder-property.jpg';
  }

  isCurrentMediaImage(): boolean {
    if (this.property?.mediaPaths && this.property.mediaPaths.length > 0) {
      const path =
        this.property.mediaPaths[this.currentImageIndex].toLowerCase();
      return /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|tif|svg|heif|heic)$/i.test(
        path
      );
    }
    return false;
  }

  getOwnerInitials(): string {
    if (!this.owner) return 'U';
    const firstName = this.owner.firstName?.charAt(0) || '';
    const lastName = this.owner.lastName?.charAt(0) || '';
    return firstName + lastName;
  }

  getOwnerMemberSince(): string {
    if (!this.owner?.createdAt) return 'Unknown';
    const date = new Date(this.owner.createdAt);
    return `${date.toLocaleString('default', {
      month: 'long',
    })} ${date.getFullYear()}`;
  }

  openImagePreview(imageUrl: string): void {
    this.dialog.open(ImagePreviewComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'fullscreen-dialog',
      hasBackdrop: false,
      data: {
        imageUrl,
        title: this.property?.title,
      },
    });
  }

  openBookingDialog(): void {
    const dialogRef = this.dialog.open(BookingDialogComponent, {
      width: '600px',
      data: { property: this.property },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Booking was successful, maybe refresh property data or show a confirmation
        console.log('Booking request submitted');
      }
    });
  }

  toggleAvailability(): void {
    if (!this.property) return;
    this.propertyService.toggleAvailability(this.id).subscribe({
      next: (res) => {
        // Update the local property object to reflect the change
        if (this.property) {
          this.property.isAvailable = res;
        }
      },
      error: (err) => {
        console.error('Error updating property availability:', err);
        this.error = `Failed to update property availability: ${
          err.message || 'Unknown error'
        }`;
      },
    });
  }
}
