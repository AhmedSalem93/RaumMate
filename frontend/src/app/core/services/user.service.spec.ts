import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [UserService, { provide: Router, useValue: spy }],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
    spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should get user profile', () => {
      const mockUser: User = {
        _id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      } as User;

      let result: any;
      service.getProfile().subscribe((res) => {
        result = res;
      });

      const req = httpMock.expectOne('http://localhost:3000/api/users/profile');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer mock-token'
      );
      req.flush({ user: mockUser });

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', () => {
      const mockForm = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const mockResponse = {
        user: {
          _id: '123',
          email: 'test@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };

      let result: any;
      service.updateProfile(mockForm).subscribe((res) => {
        result = res;
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/update-profile'
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockForm);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', () => {
      const email = 'test@example.com';

      service.deleteProfile(email).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/delete-profile'
      );
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ email });
      req.flush({});

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('completeProfile', () => {
    it('should complete user profile', () => {
      const mockForm = {
        bio: 'Test bio',
        interests: ['reading', 'hiking'],
      };

      const mockResponse = {
        user: {
          _id: '123',
          email: 'test@example.com',
          bio: 'Test bio',
          interests: ['reading', 'hiking'],
        },
      };

      let result: any;
      service.completeProfile(mockForm).subscribe((res) => {
        result = res;
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/complete-profile'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockForm);
      req.flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('preferences', () => {
    it('should get user preferences', () => {
      const mockResponse = {
        user: {
          preferences: {
            notifications: true,
            theme: 'dark',
          },
        },
      };

      service.getPreferences().subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/preferences'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should update user preferences', () => {
      const mockPreferences = {
        notifications: false,
        theme: 'light',
      };

      service.updatePreferences(mockPreferences).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/preferences'
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockPreferences);
      req.flush({ user: { preferences: mockPreferences } });
    });

    it('should delete user preferences', () => {
      service.deletePreferences().subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/preferences'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('profile picture', () => {
    it('should upload profile picture', () => {
      const mockFormData = new FormData();
      const mockResponse = { url: 'http://example.com/picture.jpg' };

      service.uploadProfilePicture(mockFormData).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/upload-profile-picture'
      );
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should delete profile picture', () => {
      service.deleteProfilePicture().subscribe();

      const req = httpMock.expectOne(
        'http://localhost:3000/api/users/delete-profile-picture'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getViewProfile', () => {
    it('should get view profile for a user', () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      service.getViewProfile(email).subscribe();

      const req = httpMock.expectOne(
        `http://localhost:3000/api/users/view-profile/${email}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUser });
    });
  });
});
