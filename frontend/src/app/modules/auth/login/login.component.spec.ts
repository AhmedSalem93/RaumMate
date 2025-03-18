import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { User } from '../../../shared/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let routerMock: jasmine.SpyObj<Router>;

  // Mock complete user profile
  const mockCompleteUser: User = {
    _id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'guest',
    isVerified: true,
    profileCompleted: true,
  };

  // Mock incomplete user profile
  const mockIncompleteUser: User = {
    _id: '1',
    email: 'test@example.com',
    firstName: '',
    lastName: '',
    role: 'verified',
    isVerified: true,
    profileCompleted: false,
  };

  beforeEach(async () => {
    // Create mock services
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    userServiceMock = jasmine.createSpyObj('UserService', ['getProfile']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty form data initially', () => {
    expect(component.formData.email).toBe('');
    expect(component.formData.password).toBe('');
    expect(component.errorMessage).toBe('');
  });

  describe('login method', () => {
    let mockForm: jasmine.SpyObj<NgForm>;

    beforeEach(() => {
      mockForm = jasmine.createSpyObj('NgForm', ['valid'], {
        value: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
    });

    it('should set error message when login fails', () => {
      const errorResponse = { error: { message: 'Invalid credentials' } };
      authServiceMock.login.and.returnValue(throwError(() => errorResponse));

      // Call login method
      component.login(mockForm);

      // Verify expected outcomes
      expect(authServiceMock.login).toHaveBeenCalledWith(mockForm);
      expect(userServiceMock.getProfile).not.toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Invalid credentials');
    });

    it('should set generic error message when login fails without specific message', () => {
      const errorResponse = { error: {} };
      authServiceMock.login.and.returnValue(throwError(() => errorResponse));

      // Call login method
      component.login(mockForm);

      // Verify expected outcomes
      expect(component.errorMessage).toBe('An error occurred during login');
    });

    it('should set error message when getProfile fails after successful login', () => {
      const errorResponse = { error: { message: 'Failed to get profile' } };
      authServiceMock.login.and.returnValue(of({}));
      userServiceMock.getProfile.and.returnValue(
        throwError(() => errorResponse)
      );

      // Call login method
      component.login(mockForm);

      // Verify expected outcomes
      expect(authServiceMock.login).toHaveBeenCalledWith(mockForm);
      expect(userServiceMock.getProfile).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Failed to get profile');
    });
  });
});
