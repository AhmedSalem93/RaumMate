import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Verify there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should log in user and store token', () => {
      // Create mock form
      const mockForm = {
        value: { email: 'test@example.com', password: 'password123' },
      } as NgForm;

      // Mock response
      const mockResponse = {
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      // Call the method
      service.login(mockForm).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('fake-token');
      });

      // Expect a POST request to the correct URL
      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockForm.value);

      // Respond with mock data
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register user and store token', () => {
      const mockForm = {
        value: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        },
      } as NgForm;

      const mockResponse = {
        token: 'fake-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      service.register(mockForm).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('fake-token');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockForm.value);

      req.flush(mockResponse);
    });
  });

  describe('verifyEmail', () => {
    it('should send verification token to server', () => {
      const token = 'verification-token';
      const mockResponse = { message: 'Email verified successfully' };

      service.verifyEmail(token).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `http://localhost:3000/api/auth/verify-email/${token}`
      );
      expect(req.request.method).toBe('GET');

      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage and navigate to login page', () => {
      // Setup token in localStorage
      localStorage.setItem('token', 'fake-token');

      // Spy on router navigate method
      const navigateSpy = spyOn(router, 'navigate');

      // Call logout method
      service.logout();

      // Check if token was removed
      expect(localStorage.getItem('token')).toBeNull();

      // Check if navigation occurred
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('changePassword', () => {
    it('should send password change request and update token', () => {
      const mockForm = {
        value: {
          oldPassword: 'oldpass',
          newPassword: 'newpass',
        },
      } as NgForm;

      const mockResponse = {
        token: 'new-token',
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
      };

      service.changePassword(mockForm).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('token')).toBe('new-token');
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/auth/change-password'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockForm.value);

      req.flush(mockResponse);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'fake-token');
      expect(service.isLoggedIn()).toBeTruthy();
    });

    it('should return false when token does not exist', () => {
      localStorage.removeItem('token');
      expect(service.isLoggedIn()).toBeFalsy();
    });
  });
});
