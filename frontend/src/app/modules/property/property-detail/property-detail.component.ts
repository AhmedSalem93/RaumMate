import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { RatingComponentComponent } from '../rating-component/rating-component.component';
import { Rating } from '../../../shared/models/rating.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import {
  RatingService,
  RatingStatsResponse,
} from '../../../core/services/rating.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    RatingComponentComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  id = '';
  property: Property | null = null;
  owner: User | null = null;
  currentImageIndex = 0;
  isLoading = true;
  error: string | null = null;
  isFavorite = false;
  dummyRatings: Rating[] = []; // Will be replaced with actual ratings
  ratingStats: RatingStatsResponse | null = null;

  // Rating form properties
  ratingForm: FormGroup;
  ratingValue = 0;
  submittingRating = false;
  ratingSuccess = false;
  isAuthenticated = false;

  constructor(
    private propertyService: PropertyService,
    private ratingService: RatingService,
    private sanitizer: DomSanitizer
  ) {
    this.ratingForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      comment: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.fetchPropertyDetails();
      if (this.isAuthenticated) {
        this.checkUserReview();
      }
    });

    // Generate some dummy ratings for now
    this.generateDummyRatings();
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

        // Fetch rating statistics after property details are loaded
        if (this.property && this.property.reviews.count > 0) {
          this.fetchRatingStats();
        }
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

  fetchRatingStats(): void {
    this.ratingService.getRatingStats(this.id).subscribe({
      next: (stats) => {
        this.ratingStats = stats;
        console.log('Rating stats received:', stats);
      },
      error: (err) => {
        console.error('Error fetching rating stats:', err);
      },
    });
  }

  // Rating form methods
  setRating(value: number): void {
    this.ratingValue = value;
    this.ratingForm.get('rating')?.setValue(value);
  }

  submitRating(): void {
    if (this.ratingForm.invalid) {
      return;
    }

    this.submittingRating = true;
    const { rating, comment } = this.ratingForm.value;

    this.ratingService
      .addRating(this.id, rating, comment)
      .pipe(finalize(() => (this.submittingRating = false)))
      .subscribe({
        next: (response) => {
          this.ratingSuccess = true;
          // Reset form
          this.ratingForm.reset();
          this.ratingValue = 0;

          // Refresh rating stats and property details
          this.fetchRatingStats();
          this.fetchPropertyDetails();

          // Add the new rating to the list (would be replaced by actual API call in production)
          const newRating: Rating = {
            property: this.id,
            rating,
            comment,
            createdAt: new Date(),
          };

          // Clear success message after a delay
          setTimeout(() => {
            this.ratingSuccess = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Error submitting rating:', err);
        },
      });
  }

  checkUserReview(): void {
    // Check if the current user has already reviewed this property
    // This would be implemented with an actual API call in production
    // For now, just mock the functionality
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: `/property/${this.id}` },
    });
  }

  getRatingCount(star: number): number {
    if (!this.ratingStats) return 0;
    return (
      this.ratingStats.distribution[
        star as keyof typeof this.ratingStats.distribution
      ] || 0
    );
  }

  getRatingPercentage(star: number): number {
    if (!this.ratingStats || this.ratingStats.totalReviews === 0) return 0;
    const count = this.getRatingCount(star);
    return (count / this.ratingStats.totalReviews) * 100;
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

  // Temporary method to generate dummy ratings for display purposes
  private generateDummyRatings(): void {
    const dummyUser: User = {
      email: 'user@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'registered',
      isVerified: true,
    };

    this.dummyRatings = [
      {
        property: this.id,
        user: dummyUser,
        rating: 4,
        comment: 'Great location and very clean property!',
        createdAt: new Date(),
      },
      {
        property: this.id,
        user: dummyUser,
        rating: 5,
        comment: 'Excellent place, highly recommended!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];
  }
}
