import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { UserService } from '../../../core/services/user.service';
import { ReviewService } from '../../../services/review.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Mock SlidebarComponent
@Component({
  selector: 'app-mock-slidebar', // Changed selector to avoid conflict
  template: '<div>Mock Sidebar</div>',
})
class MockSlidebarComponent {
  @Input() user: any;
  @Input() reviews: any[] = [];
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceMock: any;
  let reviewServiceMock: any;
  let routerMock: any;

  const mockUser = {
    userId: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    profileCompleted: true,
    preferences: {
      priceRange: '$500-$800',
      roomType: 'Private',
    },
    interests: {
      smoking: 'false',
      pets: 'true',
    },
  };

  const mockReviews = [
    {
      _id: '1',
      rating: 4,
      comment: 'Great roommate!',
      reviewer: { firstName: 'Jane', lastName: 'Smith' },
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    // Create mocks for services
    userServiceMock = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(of(mockUser)),
    };

    reviewServiceMock = {
      getUserReviews: jasmine
        .createSpy('getUserReviews')
        .and.returnValue(of(mockReviews)),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      declarations: [MockSlidebarComponent], // Declare the mock component
      imports: [CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ReviewService, useValue: reviewServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    // Create custom element to replace the actual SlidebarComponent
    TestBed.overrideComponent(ProfileComponent, {
      set: {
        imports: [CommonModule],
        template: `
          <div class="profile-dashboard">
            <app-mock-slidebar [user]="user" [reviews]="reviews"></app-mock-slidebar>
            <!-- Rest of the template -->
            <section class="profile-content">
              <!-- Content remains the same -->
            </section>
          </div>
        `,
      },
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to login page if no token found', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to complete profile if profile is not completed', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    userServiceMock.getProfile.and.returnValue(
      of({ ...mockUser, profileCompleted: false })
    );
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['user/complete-profile']);
  });

  it('should load user profile data', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    fixture.detectChanges();
    expect(userServiceMock.getProfile).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
  });

  it('should load user reviews', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    component.user = mockUser;
    fixture.detectChanges();
    expect(reviewServiceMock.getUserReviews).toHaveBeenCalledWith(
      mockUser.userId
    );
    expect(component.reviews).toEqual(mockReviews);
  });

  it('should return preferences keys', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    component.user = mockUser;
    fixture.detectChanges();
    const keys = component.getPreferencesKeys();
    expect(keys).toEqual(['priceRange', 'roomType']);
  });

  it('should return interests keys', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    component.user = mockUser;
    fixture.detectChanges();
    const keys = component.getInterestsKeys();
    expect(keys).toEqual(['smoking', 'pets']);
  });

  it('should format keys correctly', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    fixture.detectChanges();
    expect(component.formatKey('priceRange')).toBe('Price Range');
    expect(component.formatKey('roomType')).toBe('Room Type');
  });

  it('should return empty array when user has no preferences', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    component.user = { ...mockUser, preferences: null };
    fixture.detectChanges();
    expect(component.getPreferencesKeys()).toEqual([]);
  });

  it('should return empty array when user has no interests', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    component.user = { ...mockUser, interests: null };
    fixture.detectChanges();
    expect(component.getInterestsKeys()).toEqual([]);
  });
});
