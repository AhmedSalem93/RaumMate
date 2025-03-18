import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingComponent } from './setting.component';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SlidebarComponent } from '../../../shared/components/slidebar/slidebar.component';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { User } from '../../../shared/models/user.model';

describe('SettingComponent', () => {
  let component: SettingComponent;
  let fixture: ComponentFixture<SettingComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let reviewServiceSpy: jasmine.SpyObj<ReviewService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    _id: '123',
    email: 'test@example.com',
    profileCompleted: true,
    profilePicture: 'https://example.com/photo.jpg',
    address: '123 Test St',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country',
    bio: 'Test bio',
    firstName: '',
    lastName: '',
    role: 'guest',
    isVerified: false,
  };

  const mockReviews = [
    { id: '1', content: 'Great roommate!', rating: 5 },
    { id: '2', content: 'Very clean', rating: 4 },
  ];

  beforeEach(async () => {
    // Create spies for all required services
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getProfile',
      'updateProfile',
      'deleteProfile',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    reviewServiceSpy = jasmine.createSpyObj('ReviewService', [
      'getUserReviews',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['changePassword']);

    // Set default return values for methods
    userServiceSpy.getProfile.and.returnValue(of(mockUser));
    reviewServiceSpy.getUserReviews.and.returnValue(of(mockReviews));
    localStorage.setItem('token', 'fake-token');

    await TestBed.configureTestingModule({
      imports: [SettingComponent, FormsModule, CommonModule, SlidebarComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ReviewService, useValue: reviewServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to login if no token exists', () => {
    localStorage.removeItem('token');
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to complete-profile if profile is not completed', () => {
    const incompleteUser = { ...mockUser, profileCompleted: false };
    userServiceSpy.getProfile.and.returnValue(of(incompleteUser));
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['user/complete-profile']);
  });

  it('should load user profile and reviews on init', () => {
    fixture.detectChanges();
    expect(component.user).toEqual(mockUser);
    expect(component.reviews).toEqual(mockReviews);
    expect(userServiceSpy.getProfile).toHaveBeenCalled();
    expect(reviewServiceSpy.getUserReviews).toHaveBeenCalledWith(mockUser._id!);
  });

  it('should change password successfully', () => {
    fixture.detectChanges();
    const formValue = {
      oldPassword: 'oldPass123',
      newPassword: 'newPass123',
      confirmNewPassword: 'newPass123',
    };

    // Create a mock NgForm
    const ngForm = jasmine.createSpyObj('NgForm', ['resetForm'], {
      value: formValue,
      valid: true,
    });

    authServiceSpy.changePassword.and.returnValue(of({ success: true }));

    spyOn(window, 'alert');
    component.changePassword(ngForm as unknown as NgForm);

    expect(authServiceSpy.changePassword).toHaveBeenCalledWith(ngForm);
    expect(window.alert).toHaveBeenCalledWith('Password changed successfully');
  });

  it('should handle password change error', () => {
    fixture.detectChanges();
    const formValue = {
      oldPassword: 'oldPass123',
      newPassword: 'newPass123',
      confirmNewPassword: 'newPass123',
    };

    const ngForm = jasmine.createSpyObj('NgForm', ['resetForm'], {
      value: formValue,
      valid: true,
    });

    const errorResponse = { error: { message: 'Incorrect old password' } };
    authServiceSpy.changePassword.and.returnValue(
      throwError(() => errorResponse)
    );

    spyOn(window, 'alert');
    component.changePassword(ngForm as unknown as NgForm);

    expect(authServiceSpy.changePassword).toHaveBeenCalledWith(ngForm);
    expect(window.alert).toHaveBeenCalledWith(
      'An error occurred while changing password'
    );
    expect(component.errorMessage).toBe('Incorrect old password');
  });

  it('should update profile successfully', () => {
    fixture.detectChanges();

    const formValue = {
      address: '456 New St',
      city: 'New City',
      postalCode: '54321',
      country: 'New Country',
      bio: 'Updated bio',
      Smoking: 'Yes',
      Pets: 'No',
      Budget: '1500',
      RoommateGender: 'Male',
      Cleanliness: 'High',
      NoiseTolerance: 'Low',
      WorkFromHome: 'No',
      Music: true,
      Sports: true,
      Reading: false,
      Gaming: true,
      Cooking: true,
      Gardening: false,
      Traveling: true,
      Photography: true,
      Painting: false,
      Dancing: false,
    };

    const ngForm = jasmine.createSpyObj('NgForm', ['resetForm'], {
      value: formValue,
      valid: true,
    });

    userServiceSpy.updateProfile.and.returnValue(of({ success: true }));

    spyOn(window, 'alert');
    component.updateProfile(ngForm as unknown as NgForm);

    expect(userServiceSpy.updateProfile).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Profile updated successfully');
  });

  it('should handle profile update error', () => {
    fixture.detectChanges();

    const ngForm = jasmine.createSpyObj('NgForm', ['resetForm'], {
      value: {},
      valid: true,
    });

    const errorResponse = { error: { message: 'Failed to update profile' } };
    userServiceSpy.updateProfile.and.returnValue(
      throwError(() => errorResponse)
    );

    spyOn(window, 'alert');
    component.updateProfile(ngForm as unknown as NgForm);

    expect(userServiceSpy.updateProfile).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'An error occurred while updating profile'
    );
    expect(component.errorMessage).toBe('Failed to update profile');
  });

  it('should delete profile successfully', () => {
    fixture.detectChanges();
    component.user = mockUser;

    userServiceSpy.deleteProfile.and.returnValue(of({ success: true }));

    spyOn(window, 'alert');
    component.deleteProfile();

    expect(userServiceSpy.deleteProfile).toHaveBeenCalledWith(mockUser.email);
    expect(window.alert).toHaveBeenCalledWith('Profile deleted successfully');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/register']);
  });

  it('should handle profile deletion error', () => {
    fixture.detectChanges();
    component.user = mockUser;

    const errorResponse = { error: { message: 'Failed to delete profile' } };
    userServiceSpy.deleteProfile.and.returnValue(
      throwError(() => errorResponse)
    );

    spyOn(window, 'alert');
    component.deleteProfile();

    expect(userServiceSpy.deleteProfile).toHaveBeenCalledWith(mockUser.email);
    expect(window.alert).toHaveBeenCalledWith(
      'An error occurred while deleting profile'
    );
    expect(component.errorMessage).toBe('Failed to delete profile');
  });

  it('should return all interest keys', () => {
    fixture.detectChanges();
    const interests = component.getInterests();
    expect(interests).toContain('Music');
    expect(interests).toContain('Sports');
    expect(interests).toContain('Reading');
    expect(interests).toContain('Gaming');
    expect(interests).toContain('Cooking');
    expect(interests).toContain('Traveling');
  });
});
