import { TestBed } from '@angular/core/testing';
import { ReviewService } from './review.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/reviews';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReviewService],
    });
    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a review', () => {
    const mockReview = {
      userId: '123',
      apartmentId: '456',
      rating: 5,
      comment: 'Great apartment!',
    };
    const mockResponse = {
      _id: '789',
      ...mockReview,
      createdAt: new Date().toISOString(),
    };

    service.addReview(mockReview).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockReview);
    req.flush(mockResponse);
  });

  it('should get reviews for a user', () => {
    const userId = '123';
    const mockReviews = [
      { _id: '1', userId, rating: 4, comment: 'Good' },
      { _id: '2', userId, rating: 5, comment: 'Excellent' },
    ];

    service.getUserReviews(userId).subscribe((reviews) => {
      expect(reviews).toEqual(mockReviews);
    });

    const req = httpMock.expectOne(`${apiUrl}/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  it('should get reviews for an apartment', () => {
    const apartmentId = '456';
    const mockReviews = [
      { _id: '1', apartmentId, rating: 3, comment: 'Average' },
      { _id: '2', apartmentId, rating: 4, comment: 'Good location' },
    ];

    service.getApartmentReviews(apartmentId).subscribe((reviews) => {
      expect(reviews).toEqual(mockReviews);
    });

    const req = httpMock.expectOne(`${apiUrl}/apartment/${apartmentId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReviews);
  });

  it('should delete a review', () => {
    const reviewId = '789';
    const mockResponse = { message: 'Review deleted successfully' };

    service.deleteReview(reviewId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/${reviewId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
