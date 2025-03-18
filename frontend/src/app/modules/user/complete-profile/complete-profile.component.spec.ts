import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

import { CompleteProfileComponent } from './complete-profile.component';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user.model';

describe('CompleteProfileComponent', () => {
  let component: CompleteProfileComponent;
  let fixture: ComponentFixture<CompleteProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for the UserService and Router
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getProfile',
      'uploadProfilePicture',
      'completeProfile',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock the localStorage
    let store: { [key: string]: string } = { token: 'fake-token' };
    spyOn(localStorage, 'getItem').and.callFake((key) => store[key] || null);

    // Setup default return values for the spy methods with proper User type
    const mockUser: User = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'registered',
      isVerified: true,
      profileCompleted: false,
    };
    userServiceSpy.getProfile.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, CompleteProfileComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if no token exists', () => {
    // Override the localStorage spy for this specific test
    spyOn(localStorage, 'getItem').and.returnValue(null);

    // Re-initialize the component to trigger ngOnInit
    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to profile if profile already completed', () => {
    // Reset the previous getProfile call to avoid conflict
    userServiceSpy.getProfile.calls.reset();

    // Create a valid User object with profileCompleted = true
    const completedUser: User = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'registered',
      isVerified: true,
      profileCompleted: true,
    };

    userServiceSpy.getProfile.and.returnValue(of(completedUser));

    component.ngOnInit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['user/profile']);
  });

  it('should load user profile on init', () => {
    // Reset previous calls
    userServiceSpy.getProfile.calls.reset();

    // Create a valid User object
    const mockUser: User = {
      _id: '123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'registered',
      isVerified: true,
      profileCompleted: false,
    };

    userServiceSpy.getProfile.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(component.user).toEqual(mockUser);
  });

  it('should handle file selection and upload profile picture', () => {
    const mockFile = new File(['dummy content'], 'test.png', {
      type: 'image/png',
    });
    const mockEvent = { target: { files: [mockFile] } };
    const mockResponse = { imageUrl: 'http://example.com/image.jpg' };

    userServiceSpy.uploadProfilePicture.and.returnValue(of(mockResponse));

    component.onFileSelected(mockEvent);

    expect(userServiceSpy.uploadProfilePicture).toHaveBeenCalled();
    expect(component.profile.profilePicture).toBe(mockResponse.imageUrl);
  });

  it('should handle file upload errors', () => {
    const mockFile = new File(['dummy content'], 'test.png', {
      type: 'image/png',
    });
    const mockEvent = { target: { files: [mockFile] } };

    userServiceSpy.uploadProfilePicture.and.returnValue(
      throwError(() => new Error('Upload failed'))
    );

    component.onFileSelected(mockEvent);

    expect(component.errorMessage).toBe('Failed to upload profile picture');
  });

  it('should retrieve interests correctly', () => {
    const interests = component.getInterests();

    expect(interests).toContain('Music');
    expect(interests).toContain('Sports');
    expect(interests).toContain('Gaming');
    // Check length matches the number of interests in the component
    expect(interests.length).toBe(
      Object.keys(component.profile.interests).length
    );
  });

  it('should submit profile successfully', () => {
    userServiceSpy.completeProfile.and.returnValue(of({}));

    component.submitProfile();

    expect(userServiceSpy.completeProfile).toHaveBeenCalledWith(
      component.profile
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['user/profile']);
  });

  it('should handle profile submission errors', () => {
    const errorResponse = { error: { message: 'Submission failed' } };
    userServiceSpy.completeProfile.and.returnValue(
      throwError(() => errorResponse)
    );

    component.submitProfile();

    expect(component.errorMessage).toBe('Submission failed');
  });

  it('should handle profile submission errors with default message when no specific error', () => {
    userServiceSpy.completeProfile.and.returnValue(
      throwError(() => ({ error: {} }))
    );

    component.submitProfile();

    expect(component.errorMessage).toBe(
      'An error occurred while completing your profile'
    );
  });
});
