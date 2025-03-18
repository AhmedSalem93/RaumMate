import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Management', () => {
    it('should get users', () => {
      const mockUsers = [{ id: '1', name: 'Test User' }];

      service.getUsers().subscribe((users) => {
        expect(users).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should update user', () => {
      const userId = '1';
      const mockUser = { name: 'Updated User' };

      service.updateUser(userId, mockUser).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUser);
      req.flush({});
    });

    it('should delete user', () => {
      const userId = '1';

      service.deleteUser(userId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('Property Management', () => {
    it('should get properties', () => {
      const mockProperties = [{ id: '1', name: 'Test Property' }];

      service.getProperties().subscribe((properties) => {
        expect(properties).toEqual(mockProperties);
      });

      const req = httpMock.expectOne(`${apiUrl}/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperties);
    });

    it('should verify property', () => {
      const propertyId = '1';

      service.verifyProperty(propertyId).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/properties/${propertyId}/verify`
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should reject property', () => {
      const propertyId = '1';

      service.rejectProperty(propertyId).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/properties/${propertyId}/reject`
      );
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  describe('Review Management', () => {
    it('should get reviews', () => {
      const mockReviews = [{ id: '1', text: 'Test Review' }];

      service.getReviews().subscribe((reviews) => {
        expect(reviews).toEqual(mockReviews);
      });

      const req = httpMock.expectOne(`${apiUrl}/reviews`);
      expect(req.request.method).toBe('GET');
      req.flush(mockReviews);
    });

    it('should approve review', () => {
      const reviewId = '1';

      service.approveReview(reviewId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reviews/${reviewId}/approve`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('should reject review', () => {
      const reviewId = '1';

      service.rejectReview(reviewId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reviews/${reviewId}/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
  });

  describe('System Metrics', () => {
    it('should get system metrics', () => {
      const mockMetrics = { users: 100, properties: 50 };

      service.getSystemMetrics().subscribe((metrics) => {
        expect(metrics).toEqual(mockMetrics);
      });

      const req = httpMock.expectOne(`${apiUrl}/metrics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });
  });
});
