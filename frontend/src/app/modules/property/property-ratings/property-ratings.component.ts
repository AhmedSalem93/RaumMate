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
import { RatingComponentComponent } from '../rating-component/rating-component.component';
import { Rating } from '../../../shared/models/rating.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
    RatingPaginatedResponse,
  RatingService,
  RatingStatsResponse,
} from '../../../core/services/rating.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-property-ratings',
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
  templateUrl: './property-ratings.component.html',
  styleUrl: './property-ratings.component.scss',
})
export class PropertyRatingsComponent implements OnInit {
  @Input() propertyId!: string;
  @Input() reviewsCount: number = 0;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ratingService = inject(RatingService);

  ratings: Rating[] = [];
  ratingStats: RatingStatsResponse | null = null;
  isLoadingRatings = false;

  // Rating form properties
  ratingForm: FormGroup;
  ratingValue = 0;
  submittingRating = false;
  ratingSuccess = false;
  isAuthenticated = false;

  constructor() {
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

    if (this.isAuthenticated) {
      this.checkUserReview();
    }

    // Fetch ratings and stats if there are reviews
    if (this.reviewsCount > 0) {
      this.fetchRatingStats();
      this.fetchRatings();
    }
  }

  fetchRatings(): void {
    this.isLoadingRatings = true;
    this.ratingService.getPropertyRatings(this.propertyId)
      .pipe(finalize(() => this.isLoadingRatings = false))
      .subscribe({
        next: (response: RatingPaginatedResponse) => {
          this.ratings = response.ratings;
        },
        error: (err) => {
          console.error('Error fetching ratings:', err);
        }
      });
  }

  fetchRatingStats(): void {
    this.ratingService.getRatingStats(this.propertyId).subscribe({
      next: (stats) => {
        this.ratingStats = stats;
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
      .addRating(this.propertyId, rating, comment)
      .pipe(finalize(() => (this.submittingRating = false)))
      .subscribe({
        next: (response) => {
          this.ratingSuccess = true;
          // Reset form
          this.ratingForm.reset();
          this.ratingValue = 0;

          // Refresh ratings and stats
          this.fetchRatingStats();
          this.fetchRatings();

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
      queryParams: { returnUrl: `/property/${this.propertyId}` },
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
} 