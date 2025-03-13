import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyRatingsComponent } from './property-ratings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../core/services/auth.service';
import {
  MyRatingResponse,
  RatingPaginatedResponse,
  RatingService,
} from '../../../core/services/rating.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Rating } from '../../../shared/models/rating.model';

describe('PropertyRatingsComponent', () => {
  let component: PropertyRatingsComponent;
  let fixture: ComponentFixture<PropertyRatingsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let ratingServiceSpy: jasmine.SpyObj<RatingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRatingStatsResponse = {
    averageRating: 4.2,
    totalReviews: 5,
    distribution: {
      1: 0,
      2: 0,
      3: 1,
      4: 2,
      5: 2,
    },
  };

  const mockRatings: Rating[] = [
    {
      property: 'prop123',
      user: {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'registered',
        isVerified: true,
      },
      rating: 5,
      comment: 'Great property!',
      createdAt: new Date('2023-05-15'),
    },
    {
      property: 'prop123',
      user: {
        id: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'registered',
        isVerified: true,
      },
      rating: 4,
      comment: 'Good location',
      createdAt: new Date('2023-06-10'),
    },
  ];

  const mockMyRating: Rating = {
    property: 'prop123',
    user: {
      id: 'currentUser',
      firstName: 'Current',
      lastName: 'User',
      email: 'current@example.com',
      role: 'registered',
      isVerified: true,
    },
    rating: 4,
    comment: 'My review comment',
    createdAt: new Date('2023-07-01'),
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const ratingSpy = jasmine.createSpyObj('RatingService', [
      'getPropertyRatings',
      'getRatingStats',
      'getMyRatingsOnProp',
      'addRating',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PropertyRatingsComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: RatingService, useValue: ratingSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    ratingServiceSpy = TestBed.inject(
      RatingService
    ) as jasmine.SpyObj<RatingService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Default mock responses
    authServiceSpy.isAuthenticated.and.returnValue(true);
    ratingServiceSpy.getPropertyRatings.and.returnValue(
      of({ ratings: mockRatings } as RatingPaginatedResponse)
    );
    ratingServiceSpy.getRatingStats.and.returnValue(
      of(mockRatingStatsResponse)
    );
    ratingServiceSpy.getMyRatingsOnProp.and.returnValue(
      of({
        hasRated: true,
        rating: mockMyRating,
      })
    );
    ratingServiceSpy.addRating.and.returnValue(of(mockMyRating));

    fixture = TestBed.createComponent(PropertyRatingsComponent);
    component = fixture.componentInstance;
    component.propertyId = 'prop123';
    component.reviewsCount = 3;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check authentication status on init', () => {
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(component.isAuthenticated).toBeTrue();

    // Test unauthenticated state
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.ngOnInit();
    expect(component.isAuthenticated).toBeFalse();
  });

  it('should fetch ratings and stats when reviews exist', () => {
    expect(ratingServiceSpy.getPropertyRatings).toHaveBeenCalledWith('prop123');
    expect(ratingServiceSpy.getRatingStats).toHaveBeenCalledWith('prop123');
    expect(component.ratings.length).toBe(2);
    expect(component.ratingStats).toEqual(mockRatingStatsResponse);
  });

  it('should fetch user rating when user is authenticated', () => {
    expect(ratingServiceSpy.getMyRatingsOnProp).toHaveBeenCalledWith('prop123');
    expect(component.myRating).toEqual(mockMyRating);

    // Form should be disabled and filled with existing rating
    expect(component.ratingForm.disabled).toBeTrue();
    expect(component.ratingForm.get('rating')?.value).toBe(4);
    expect(component.ratingForm.get('comment')?.value).toBe(
      'My review comment'
    );
    expect(component.isEditMode).toBeFalse();
  });

  it('should handle missing user rating correctly', () => {
    // Recreate component with no existing rating
    ratingServiceSpy.getMyRatingsOnProp.and.returnValue(
      of({
        hasRated: false,
        rating: null,
        message: undefined,
      } as unknown as MyRatingResponse)
    );
    fixture = TestBed.createComponent(PropertyRatingsComponent);
    component = fixture.componentInstance;
    component.propertyId = 'prop123';
    component.reviewsCount = 3;
    fixture.detectChanges();

    expect(component.myRating).toBeNull();
    expect(component.ratingForm.enabled).toBeTrue();
  });

  it('should toggle edit mode correctly', () => {
    // Initially not in edit mode with form disabled
    expect(component.isEditMode).toBeFalse();
    expect(component.ratingForm.disabled).toBeTrue();

    // Enable edit mode
    component.enableEditMode();
    expect(component.isEditMode).toBeTrue();
    expect(component.ratingForm.enabled).toBeTrue();

    // Cancel edit mode
    component.cancelEdit();
    expect(component.isEditMode).toBeFalse();
    expect(component.ratingForm.disabled).toBeTrue();
    expect(component.ratingForm.get('rating')?.value).toBe(mockMyRating.rating);
  });

  it('should set rating value correctly', () => {
    component.enableEditMode(); // Enable form
    component.setRating(5);
    expect(component.ratingValue).toBe(5);
    expect(component.ratingForm.get('rating')?.value).toBe(5);
  });

  it('should submit rating successfully', () => {
    // Setup form with new values
    component.enableEditMode();
    component.setRating(5);
    component.ratingForm.patchValue({ comment: 'Updated comment' });

    // Submit the form
    component.submitRating();

    expect(ratingServiceSpy.addRating).toHaveBeenCalledWith(
      'prop123',
      5,
      'Updated comment'
    );
    expect(component.isEditMode).toBeFalse();
    expect(component.ratingForm.disabled).toBeTrue();
    expect(component.ratingSuccess).toBeTrue();

    // Should refresh ratings and stats
    expect(ratingServiceSpy.getRatingStats).toHaveBeenCalledTimes(2);
    expect(ratingServiceSpy.getPropertyRatings).toHaveBeenCalledTimes(2);

    // Success message should clear after delay (mock timer)
    jasmine.clock().install();
    jasmine.clock().tick(3001);
    expect(component.ratingSuccess).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should handle submission error', () => {
    // Setup error response
    const errorResponse = new Error('Failed to submit rating');
    spyOn(console, 'error'); // Spy on console.error
    ratingServiceSpy.addRating.and.returnValue(throwError(() => errorResponse));

    // Setup form for submission
    component.enableEditMode();
    component.setRating(3);
    component.submitRating();

    expect(console.error).toHaveBeenCalledWith(
      'Error submitting rating:',
      errorResponse
    );
    expect(component.submittingRating).toBeFalse(); // Should reset loading state
  });

  it('should not submit invalid rating', () => {
    // Make form invalid (no rating)
    component.enableEditMode();
    component.ratingForm.get('rating')?.setValue(null);

    spyOn(console, 'error'); // Spy on console.error
    component.submitRating();

    expect(console.error).toHaveBeenCalledWith('Invalid rating form');
    expect(ratingServiceSpy.addRating).not.toHaveBeenCalled();
  });

  it('should navigate to login when user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.navigateToLogin();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: `/property/prop123` },
    });
  });

  it('should calculate rating counts and percentages correctly', () => {
    expect(component.getRatingCount(5)).toBe(2);
    expect(component.getRatingCount(3)).toBe(1);
    expect(component.getRatingCount(1)).toBe(0);

    expect(component.getRatingPercentage(5)).toBe(40); // 2/5 * 100
    expect(component.getRatingPercentage(4)).toBe(40); // 2/5 * 100
    expect(component.getRatingPercentage(3)).toBe(20); // 1/5 * 100
    expect(component.getRatingPercentage(2)).toBe(0);

    // Test with no reviews
    component.ratingStats!.totalReviews = 0;
    expect(component.getRatingPercentage(5)).toBe(0);
  });
});
