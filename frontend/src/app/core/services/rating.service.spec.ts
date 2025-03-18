import { TestBed } from '@angular/core/testing';
import { RatingService, RatingPaginatedResponse, RatingStatsResponse, MyRatingResponse } from './rating.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Rating } from '../../shared/models/rating.model';

describe('RatingService', () => {
  let service: RatingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RatingService]
    });
    service = TestBed.inject(RatingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeaders', () => {
    it('should return headers with token when available', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');
      // @ts-ignore - accessing private method for testing
      const headers = service.getHeaders();
      expect(headers.get('Authorization')).toBe('Bearer test-token');
      expect(headers.get('Accept')).toBe('*/*');
    });

    it('should return headers without token when not available', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      // @ts-ignore - accessing private method for testing
      const headers = service.getHeaders();
      expect(headers.get('Authorization')).toBeNull();
      expect(headers.get('Accept')).toBe('*/*');
    });
  });

  describe('addRating', () => {
    it('should add a rating successfully', () => {
      const mockRating: Rating = {
        property: 'property-123',
        rating: 4,
        comment: 'Great place!'
      };
      const propertyId = 'property-123';
      const rating = 4;
      const comment = 'Great place!';

      service.addRating(propertyId, rating, comment).subscribe(response => {
        expect(response).toEqual(mockRating);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/${propertyId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ rating, comment });
      req.flush(mockRating);
    });
  });

  describe('getPropertyRatings', () => {
    it('should return paginated ratings for a property', () => {
      const propertyId = 'property-123';
      const mockResponse: RatingPaginatedResponse = {
        ratings: [{ property: propertyId, rating: 4 }],
        summary: { averageRating: 4, count: 1 },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRatings: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      service.getPropertyRatings(propertyId, 1, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/${propertyId}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getUserRatings', () => {
    it('should return paginated ratings for a specific user', () => {
      const userId = 'user-123';
      const mockResponse: RatingPaginatedResponse = {
        ratings: [{ property: 'property-123', rating: 4, user: userId }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRatings: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      service.getUserRatings(userId, 1, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/user/${userId}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return paginated ratings for the authenticated user when userId is not provided', () => {
      const mockResponse: RatingPaginatedResponse = {
        ratings: [{ property: 'property-123', rating: 4 }],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRatings: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      service.getUserRatings(undefined, 1, 10).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/user/undefined?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMyRatingsOnProp', () => {
    it('should return user rating on a property when it exists', () => {
      const propertyId = 'property-123';
      const mockResponse: MyRatingResponse = {
        hasRated: true,
        rating: {
          property: propertyId,
          rating: 4,
          comment: 'Great place!'
        }
      };

      service.getMyRatingsOnProp(propertyId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/myratings/${propertyId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching ratings', () => {
      const propertyId = 'property-123';

      service.getMyRatingsOnProp(propertyId).subscribe(response => {
        expect(response).toEqual({
          hasRated: false,
          message: 'Error fetching rating',
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/myratings/${propertyId}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('deleteRating', () => {
    it('should delete a rating successfully', () => {
      const ratingId = 'rating-123';
      const mockResponse = { message: 'Rating deleted successfully' };

      service.deleteRating(ratingId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/${ratingId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('getRatingStats', () => {
    it('should return rating statistics for a property', () => {
      const propertyId = 'property-123';
      const mockResponse: RatingStatsResponse = {
        averageRating: 4.5,
        totalReviews: 10,
        distribution: {
          1: 0,
          2: 0,
          3: 1,
          4: 3,
          5: 6
        }
      };

      service.getRatingStats(propertyId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ratings/stats/${propertyId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
