import { Component, inject, Input, OnInit, AfterViewInit } from '@angular/core';
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
import { RatingCardComponentComponent } from '../rating-card-component/rating-component.component';
import { Rating } from '../../../shared/models/rating.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  RatingPaginatedResponse,
  RatingService,
  RatingStatsResponse,
} from '../../../core/services/rating.service';
import { finalize, retry, catchError, of } from 'rxjs';

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
    RatingCardComponentComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './property-ratings.component.html',
  styleUrl: './property-ratings.component.scss',
})
export class PropertyRatingsComponent implements OnInit, AfterViewInit {
  @Input() propertyId!: string;
  @Input() reviewsCount: number = 0;

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly ratingService = inject(RatingService);

  ratings: Rating[] = [];
  ratingStats: RatingStatsResponse | null = null;
  isLoadingRatings = false;
  myRating: Rating | null = null;
  isEditMode = false;

  // Rating form properties
  ratingForm: FormGroup;
  ratingValue = 0;
  submittingRating = false;
  ratingSuccess = false;

  constructor() {
    this.ratingForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      comment: ['', [Validators.maxLength(500)]],
    });

    // Form will be enabled for new ratings and disabled for existing ratings
    // This will be handled in fetchMyRating()
  }

  get isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }
  ngOnInit(): void {
    console.log(
      'PropertyRatingsComponent initialized with propertyId:',
      this.propertyId
    );

    // First, check if the user is authenticated and fetch their rating
    if (this.isAuthenticated) {
      console.log('User is authenticated, fetching their rating');
      // Fetch the user's rating first
      this.fetchMyRating();
    } else {
      console.log('User is not authenticated');
    }

    // Then fetch ratings and stats if there are reviews
    if (this.reviewsCount > 0) {
      console.log('Property has reviews, fetching ratings and stats');
      this.fetchRatingStats();
      this.fetchRatings();
    } else {
      console.log('Property has no reviews yet');
    }
  }

  ngAfterViewInit(): void {
    // Try fetching the user's rating again after the view has been initialized
    // This helps in cases where the component might not have been fully initialized during ngOnInit
    setTimeout(() => {
      if (this.isAuthenticated && !this.myRating) {
        console.log('AfterViewInit: Trying to fetch user rating again');
        this.fetchMyRating();
      }
    }, 500);
  }

  // Check if the user has already rated this property
  hasUserRated(): boolean {
    return !!this.myRating;
  }

  fetchRatings(): void {
    this.isLoadingRatings = true;
    this.ratingService
      .getPropertyRatings(this.propertyId)
      .pipe(finalize(() => (this.isLoadingRatings = false)))
      .subscribe({
        next: (response: RatingPaginatedResponse) => {
          this.ratings = response.ratings;
        },
        error: (err) => {
          console.error('Error fetching ratings:', err);
        },
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

  fetchMyRating(): void {
    console.log('Fetching my rating for property:', this.propertyId);

    // Add a loading indicator if needed
    this.ratingService
      .getMyRatingsOnProp(this.propertyId)
      .pipe(
        // Add a retry mechanism in case of network issues
        retry(1),
        // Ensure we complete the observable even if there's an error
        catchError((err) => {
          console.error('Error fetching user rating:', err);
          // Enable the form in case of error
          this.ratingForm.enable();
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (!response) {
            console.log('No response received for my rating');
            return;
          }

          console.log('My rating response:', response);

          if (response.rating && response.hasRated) {
            this.myRating = response.rating;
            console.log('My rating found:', this.myRating);

            // Pre-fill the form with existing rating
            this.ratingForm.patchValue({
              rating: this.myRating.rating,
              comment: this.myRating.comment || '',
            });
            this.ratingValue = this.myRating.rating;

            // Disable the form initially
            this.ratingForm.disable();
            this.isEditMode = false;
          } else {
            console.log('No existing rating found');
            // Enable the form for new ratings
            this.ratingForm.enable();
            this.myRating = null;
          }
        },
      });
  }

  enableEditMode(): void {
    this.isEditMode = true;
    this.ratingForm.enable();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.myRating) {
      this.ratingForm.patchValue({
        rating: this.myRating.rating,
        comment: this.myRating.comment || '',
      });
      this.ratingValue = this.myRating.rating;
    }
    this.ratingForm.disable();
  }

  // Rating form methods
  setRating(value: number): void {
    this.ratingValue = value;
    this.ratingForm.get('rating')?.setValue(value);
  }

  submitRating(): void {
    if (this.ratingForm.invalid) {
      console.error('Invalid rating form');
      return;
    }

    this.submittingRating = true;
    const { rating, comment } = this.ratingForm.value;

    // Log the submission
    console.log('Submitting rating:', {
      rating,
      comment,
      isEdit: !!this.myRating,
    });

    this.ratingService
      .addRating(this.propertyId, rating, comment)
      .pipe(finalize(() => (this.submittingRating = false)))
      .subscribe({
        next: (response) => {
          this.ratingSuccess = true;

          // Update the myRating object with the response
          this.myRating = response;

          // Disable form after submission
          this.isEditMode = false;
          this.ratingForm.disable();

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
