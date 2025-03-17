import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { CurrencyPipe, NgIf, DatePipe, NgFor } from '@angular/common';
import { Property } from '../../models/property.model';
import { User } from '../../models/user.model';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { UserService } from '../../../core/services/user.service';

interface StarDisplay {
  full: boolean;
  half: boolean;
}

@Component({
  selector: 'app-property-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    NgIf,
    CurrencyPipe,
    DatePipe,
    MatIconModule,
    NgFor,
    RouterLink,
  ],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() favorite = new EventEmitter<{ id: string; value: boolean }>();
  @Output() availabilityChanged = new EventEmitter<{
    propId: string;
    available: boolean;
  }>();

  private userService = inject(UserService);
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  currentUserId: string = '';
  isOwner: boolean = false;
  ownerAvatarFallback = 'https://avatar.iran.liara.run/public/48';

  constructor() {
    // Get current user ID
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUserId = user._id!;
        // Check if the current user is the owner
        if (typeof this.property.owner === 'object') {
          this.isOwner =
            (this.property.owner as User)._id === this.currentUserId;
        } else if (typeof this.property.owner === 'string') {
          this.isOwner = this.property.owner === this.currentUserId;
        }
      },
      error: (err) => console.error('Error getting user profile:', err),
    });
  }

  isImgUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|tif|svg|heif|heic)$/i.test(
      url
    );
  }

  get firstImageUrl(): string {
    for (const mediaPath of this.property.mediaPaths) {
      if (this.isImgUrl(mediaPath)) {
        console.log('mediaPath', mediaPath);
        return `${environment.apiUrl}${mediaPath}`;
      }
    }
    return 'https://placehold.co/400x400';
  }

  get displayAmenities(): string {
    if (!this.property.amenities || this.property.amenities.length === 0) {
      return '';
    }

    // Show first 3 amenities with ellipsis if there are more
    if (this.property.amenities.length > 3) {
      return this.property.amenities.slice(0, 3).join(', ') + '...';
    }

    return this.property.amenities.join(', ');
  }

  getRoomCount(): number {
    // Extract number from title or return default
    const match = this.property.title.match(/(\d+)[-\s]?Zi/i);
    return match ? parseInt(match[1]) : 1;
  }

  getOwnerName(): string {
    if (!this.property.owner || typeof this.property.owner === 'string') {
      return '';
    }
    console.log('this.property.owner', this.property.owner);
    return (this.property.owner as User).firstName || '';
  }

  get ownerAvatarUrl(): string {
    if (!this.property.owner || typeof this.property.owner === 'string') {
      return this.ownerAvatarFallback;
    }
    return (
      (this.property.owner as User).profilePicture || this.ownerAvatarFallback
    );
  }
  getOnlineStatus(): string {
    // TODO: Implement actual online status logic here
    return 'Last Login: 9 hours ago';
  }

  getFormattedCreatedAt(): string {
    if (!this.property.createdAt) return '';
    const date = new Date(this.property.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  hasReviews(): boolean {
    return (
      this.property.reviews &&
      this.property.reviews.count > 0 &&
      this.property.reviews.averageRating > 0
    );
  }

  getStarArray(): StarDisplay[] {
    if (!this.hasReviews()) {
      return [];
    }

    const stars: StarDisplay[] = [];
    const rating = this.property.reviews.averageRating;

    for (let i = 1; i <= 5; i++) {
      // For each position calculate if it should be full, half or empty star
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push({ full: true, half: false });
      } else if (i - 0.5 <= rating) {
        // Half star
        stars.push({ full: false, half: true });
      } else {
        // Empty star
        stars.push({ full: false, half: false });
      }
    }

    return stars;
  }

  // Navigate to edit page
  editProperty(event: Event): void {
    event.stopPropagation(); // Prevent navigation to detail page
    if (this.property._id) {
      this.router.navigate(['/property/edit', this.property._id]);
    }
  }

  // Toggle property availability
  toggleAvailability(event: Event): void {
    event.stopPropagation(); // Prevent navigation to detail page
    if (this.property._id) {
      this.propertyService.toggleAvailability(this.property._id).subscribe({
        next: (isAvailable) => {
          if (this.property) {
            this.property.isAvailable = isAvailable;
            this.availabilityChanged.emit({
              propId: this.property._id!,
              available: isAvailable,
            });
          }
        },
        error: (err) => console.error('Error toggling availability:', err),
      });
    }
  }
}
