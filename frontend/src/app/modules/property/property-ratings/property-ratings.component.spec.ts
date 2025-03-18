import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { PropertyRatingsComponent } from './property-ratings.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { RatingService } from '../../../core/services/rating.service';
import { BookingService } from '../../../core/services/booking.service';
import { of, throwError } from 'rxjs';
import { Rating } from '../../../shared/models/rating.model';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RatingCardComponentComponent } from '../rating-card-component/rating-component.component';
import { Component, Input } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';

// Mock the rating card component to avoid having to import all its dependencies
@Component({
  selector: 'app-rating-component',
  template: '<div>Mocked Rating Card: {{userRating.rating}} stars</div>',
  standalone: true, // Add standalone: true
  imports: [CommonModule], // Add required imports
})
class MockRatingCardComponent {
  @Input() userRating!: Rating;
}

describe('PropertyRatingsComponent', () => {
  let component: PropertyRatingsComponent;
  let fixture: ComponentFixture<PropertyRatingsComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let ratingServiceMock: jasmine.SpyObj<RatingService>;
  let bookingServiceMock: jasmine.SpyObj<BookingService>;
  let router: Router;

  const mockPropertyId = 'property123';
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'registered' as const,
    isVerified: true,
  };

  const mockRating: Rating = {
    property: 'property123',
    user: 'user123',
    rating: 4,
    comment: 'Great property!',
    createdAt: new Date(),
  };

  const mockRatings: Rating[] = [
    {
      property: 'property123',
      user: 'user1',
      rating: 5,
      comment: 'Amazing!',
      createdAt: new Date(),
    },
    {
      property: 'property123',
      user: 'user2',
      rating: 3,
      comment: 'Decent',
      createdAt: new Date(),
    },
  ];

  const mockRatingStats = {
    averageRating: 4.2,
    totalReviews: 5,
    distribution: {
      1: 0,
      2: 1,
      3: 1,
      4: 0,
      5: 3,
    },
  };

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'getCurrentUser',
    ]);
    ratingServiceMock = jasmine.createSpyObj('RatingService', [
      'getPropertyRatings',
      'getRatingStats',
      'getMyRatingsOnProp',
      'addRating',
    ]);

    // Properly set up the BookingService mock with LivesInProperty method
    bookingServiceMock = jasmine.createSpyObj('BookingService', [
      'LivesInProperty',
    ]);
    // Set default return value for LivesInProperty to prevent undefined errors
    bookingServiceMock.LivesInProperty.and.returnValue(of(true));

    // Ensure getRatingStats always returns an observable
    ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

    // Ensure getPropertyRatings always returns an observable
    ratingServiceMock.getPropertyRatings.and.returnValue(
      of({
        ratings: mockRatings,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRatings: 2,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        HttpClientTestingModule,
        PropertyRatingsComponent, // Move to imports since it's a standalone component
        MockRatingCardComponent, // Move this to imports since it's also standalone
      ],
      declarations: [], // Empty now since both components are moved to imports
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: RatingService, useValue: ratingServiceMock },
        { provide: BookingService, useValue: bookingServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(PropertyRatingsComponent);
    component = fixture.componentInstance;
    component.propertyId = mockPropertyId;
    component.reviewsCount = 5;
  });

  describe('Initialization', () => {
    it('should check authentication and fetch data on init', () => {
      // Setup mocks
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false, message: 'No rating found' })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));

      // Initialize component
      fixture.detectChanges();

      // Check service calls
      expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
      expect(ratingServiceMock.getMyRatingsOnProp).toHaveBeenCalledWith(
        mockPropertyId
      );
      expect(ratingServiceMock.getPropertyRatings).toHaveBeenCalledWith(
        mockPropertyId
      );
      expect(ratingServiceMock.getRatingStats).toHaveBeenCalledWith(
        mockPropertyId
      );
      expect(bookingServiceMock.LivesInProperty).toHaveBeenCalledWith(
        mockPropertyId
      );
    });

    it('should not fetch user rating if user is not authenticated', () => {
      authServiceMock.isLoggedIn.and.returnValue(false);
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));
      bookingServiceMock.LivesInProperty.and.returnValue(of(false)); // Add this line

      fixture.detectChanges();

      expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
      expect(ratingServiceMock.getMyRatingsOnProp).not.toHaveBeenCalled();
      expect(ratingServiceMock.getPropertyRatings).toHaveBeenCalled();
      expect(ratingServiceMock.getRatingStats).toHaveBeenCalled();
    });

    it('should not fetch ratings if reviewsCount is 0', () => {
      component.reviewsCount = 0;
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(true)); // Add this line

      fixture.detectChanges();

      expect(ratingServiceMock.getPropertyRatings).not.toHaveBeenCalled();
      expect(ratingServiceMock.getRatingStats).not.toHaveBeenCalled();
    });
  });

  describe('Fetching Ratings', () => {
    // Make sure all tests have the BookingService mock set up
    beforeEach(() => {
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // Ensure this is set
    });

    it('should handle errors when fetching ratings', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        throwError(() => new Error('API error'))
      );
      // ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // No need to override here
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));

      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
      expect(component.ratings.length).toBe(0);
    });

    it('should handle errors when fetching rating stats', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(
        throwError(() => new Error('API error')) // Override here to throw error
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));

      spyOn(console, 'error');

      fixture.detectChanges();

      expect(console.error).toHaveBeenCalled();
      expect(component.ratingStats).toBeNull();
    });
  });

  describe('User Rating', () => {
    // Make sure all tests have the BookingService mock set up
    beforeEach(() => {
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // Ensure this is set
    });

    it('should load existing user rating', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({
          hasRated: true,
          rating: mockRating,
        })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));

      fixture.detectChanges();

      expect(component.myRating).toEqual(mockRating);
      expect(component.ratingForm.disabled).toBeTrue();
      expect(component.ratingValue).toBe(mockRating.rating);
      expect(component.ratingForm.get('comment')?.value).toBe(
        mockRating.comment
      );
    });

    it('should enable edit mode when edit button is clicked', fakeAsync(() => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({
          hasRated: true,
          rating: mockRating,
        })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      const editButton = fixture.debugElement.query(
        By.css('button[color="primary"]')
      );
      expect(editButton).toBeTruthy();

      editButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.ratingForm.enabled).toBeTrue();
    }));

    it('should submit updated rating', fakeAsync(() => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({
          hasRated: true,
          rating: mockRating,
        })
      );
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      const updatedRating = {
        ...mockRating,
        rating: 5,
        comment: 'Updated comment',
      };
      ratingServiceMock.addRating.and.returnValue(of(updatedRating));

      fixture.detectChanges();

      // Enable edit mode
      component.enableEditMode();
      fixture.detectChanges();

      // Update the form values
      component.ratingForm.patchValue({
        rating: 5,
        comment: 'Updated comment',
      });
      component.ratingValue = 5;

      // Submit the form
      component.submitRating();
      tick();
      fixture.detectChanges();

      expect(ratingServiceMock.addRating).toHaveBeenCalledWith(
        mockPropertyId,
        5,
        'Updated comment'
      );
      expect(component.myRating).toEqual(updatedRating);
      expect(component.isEditMode).toBeFalse();
      expect(component.ratingSuccess).toBeTrue();

      // Check that the form is disabled after submission
      expect(component.ratingForm.disabled).toBeTrue();

      // Check that ratings and stats are refreshed
      expect(ratingServiceMock.getRatingStats).toHaveBeenCalledTimes(2);
      expect(ratingServiceMock.getPropertyRatings).toHaveBeenCalledTimes(2);
    }));
  });

  describe('New Rating Submission', () => {
    beforeEach(() => {
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // Ensure this is set
    });

    it('should allow submitting a new rating if user has not rated and can create ratings', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      expect(component.CanCreateRatings()).toBeTrue();

      // Check if the new rating form is displayed
      const formElement = fixture.debugElement.query(By.css('form'));
      expect(formElement).toBeTruthy();
    });

    it('should not allow submitting a rating if user has already rated', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({
          hasRated: true,
          rating: mockRating,
        })
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      expect(component.CanCreateRatings()).toBeFalse();
    });

    it('should not allow submitting a rating if user has not lived in the property', () => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(false));
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      expect(component.CanCreateRatings()).toBeFalse();
    });

    it('should submit a new rating successfully', fakeAsync(() => {
      authServiceMock.isLoggedIn.and.returnValue(true);
      ratingServiceMock.getMyRatingsOnProp.and.returnValue(
        of({ hasRated: false })
      );
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      const newRating = {
        property: mockPropertyId,
        user: 'user123',
        rating: 4,
        comment: 'New comment',
        createdAt: new Date(),
      };

      ratingServiceMock.addRating.and.returnValue(of(newRating));

      fixture.detectChanges();

      // Set form values
      component.setRating(4);
      component.ratingForm.patchValue({
        comment: 'New comment',
      });

      // Submit the form
      component.submitRating();
      tick();
      fixture.detectChanges();

      expect(ratingServiceMock.addRating).toHaveBeenCalledWith(
        mockPropertyId,
        4,
        'New comment'
      );
      expect(component.myRating).toEqual(newRating);
      expect(component.ratingSuccess).toBeTrue();

      // Check that ratings and stats are refreshed
      expect(ratingServiceMock.getRatingStats).toHaveBeenCalledTimes(2);
      expect(ratingServiceMock.getPropertyRatings).toHaveBeenCalledTimes(2);
    }));
  });

  describe('Authentication Handling', () => {
    beforeEach(() => {
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // Ensure this is set
    });

    it('should show login prompt for unauthenticated users', () => {
      authServiceMock.isLoggedIn.and.returnValue(false);
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      const loginPrompt = fixture.debugElement.query(
        By.css('.card-body.text-center')
      );
      expect(loginPrompt).toBeTruthy();
      expect(loginPrompt.nativeElement.textContent).toContain('Please');
      expect(loginPrompt.nativeElement.textContent).toContain('login');
    });

    it('should navigate to login page with return URL when login link is clicked', () => {
      authServiceMock.isLoggedIn.and.returnValue(false);
      ratingServiceMock.getPropertyRatings.and.returnValue(
        of({
          ratings: mockRatings,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRatings: 2,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      );
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats));

      fixture.detectChanges();

      const loginLink = fixture.debugElement.query(By.css('a.text-primary'));
      loginLink.triggerEventHandler('click', null);

      expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
        queryParams: { returnUrl: `/property/${mockPropertyId}` },
      });
    });
  });

  describe('UI Helper Methods', () => {
    beforeEach(() => {
      bookingServiceMock.LivesInProperty.and.returnValue(of(true));
      fixture.detectChanges();
      ratingServiceMock.getRatingStats.and.returnValue(of(mockRatingStats)); // Ensure this is set
    });

    it('should calculate rating count correctly', () => {
      component.ratingStats = mockRatingStats;

      expect(component.getRatingCount(5)).toBe(3);
      expect(component.getRatingCount(3)).toBe(1);
      expect(component.getRatingCount(1)).toBe(0);
    });

    it('should calculate rating percentage correctly', () => {
      component.ratingStats = mockRatingStats;

      // 3 out of 5 ratings are 5-star = 60%
      expect(component.getRatingPercentage(5)).toBe(60);

      // 0 out of 5 ratings are 1-star = 0%
      expect(component.getRatingPercentage(1)).toBe(0);
    });

    it('should return 0 for rating count and percentage when no rating stats', () => {
      component.ratingStats = null;

      expect(component.getRatingCount(5)).toBe(0);
      expect(component.getRatingPercentage(5)).toBe(0);
    });

    it('should return 0 for rating percentage when total reviews is 0', () => {
      component.ratingStats = {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };

      expect(component.getRatingPercentage(5)).toBe(0);
    });
  });
});
