import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyRatingsComponent } from '../property-ratings/property-ratings.component';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewComponent } from '../../../shared/components/image-preview/image-preview.component';

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
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  id = '';
  property: Property | null = null;
  owner: User | null = null;
  currentImageIndex = 0;
  isLoading = true;
  error: string | null = null;
  isFavorite = false;
  isAuthenticated = false;

  constructor(
    private propertyService: PropertyService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.fetchPropertyDetails();
    });
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

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    // TODO: Implement actual favorite functionality
  }

  sendMessage(): void {
    // TODO: Implement message functionality
    console.log('Send message to owner');
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

  getMediaUrl(): SafeUrl {
    if (this.property?.mediaPaths && this.property.mediaPaths.length > 0) {
      const url = `${environment.apiUrl}${
        this.property.mediaPaths[this.currentImageIndex]
      }`;
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
    return this.sanitizer.bypassSecurityTrustUrl(
      'assets/images/placeholder-property.jpg'
    );
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
        title: this.property?.title
      }
    });
  }
}
