import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PropertyService, SearchParams } from './property.service';
import { environment } from '../../../environments/environment';
import { Property } from '../../shared/models/property.model';

describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PropertyService],
    });
    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createListing', () => {
    it('should send POST request with form data', () => {
      const mockFormData = new FormData();
      mockFormData.append('title', 'Test Property');
      const mockResponse = { id: '123', title: 'Test Property' };

      service.createListing(mockFormData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(mockFormData);
      req.flush(mockResponse);
    });
  });

  describe('getListings', () => {
    it('should return a list of properties', () => {
      const mockProperties = {
        pagination: { total: 2, limit: 10, page: 1 },
        properties: [
          {
            _id: '1',
            title: 'Property 1',
            description: 'Description 1',
            owner: 'user1',
            location: { city: 'Berlin' },
            price: 1000,
            isAvailable: true,
            isSublet: false,
            reviews: { averageRating: 4.5, count: 10 },
            amenities: ['wifi'],
            mediaPaths: [],
          },
          {
            _id: '2',
            title: 'Property 2',
            description: 'Description 2',
            owner: 'user2',
            location: { city: 'Hamburg' },
            price: 1200,
            isAvailable: true,
            isSublet: true,
            reviews: { averageRating: 4.0, count: 5 },
            amenities: ['parking'],
            mediaPaths: [],
          },
        ],
      };

      service.getListings().subscribe((response) => {
        expect(response).toEqual(mockProperties);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperties);
    });
  });

  describe('getListingById', () => {
    it('should return a single property by ID', () => {
      const mockProperty = {
        _id: '123',
        title: 'Test Property',
        description: 'A test property',
        owner: 'user123',
        location: { city: 'Berlin' },
        price: 1000,
        isAvailable: true,
        isSublet: false,
        reviews: { averageRating: 4.5, count: 10 },
        amenities: ['wifi'],
        mediaPaths: [],
      };

      service.getListingById('123').subscribe((property) => {
        expect(property).toEqual(mockProperty);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperty);
    });
  });

  describe('searchProperties', () => {
    it('should apply search parameters correctly', () => {
      const searchParams: SearchParams = {
        city: 'Berlin',
        minPrice: 800,
        maxPrice: 1500,
        isSublet: true,
        amenities: ['wifi', 'parking'],
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        pagination: { total: 1, limit: 10, page: 1 },
        properties: [
          {
            _id: '2',
            title: 'Property 2',
            description: 'Description 2',
            owner: 'user2',
            location: { city: 'Berlin' },
            price: 1200,
            isAvailable: true,
            isSublet: true,
            reviews: { averageRating: 4.0, count: 5 },
            amenities: ['wifi', 'parking'],
            mediaPaths: [],
          },
        ],
      };

      service.searchProperties(searchParams).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Check that URL contains all the expected query parameters
      const expectedUrl = `${environment.apiUrl}/properties?page=1&limit=10&city=Berlin&minPrice=800&maxPrice=1500&isSublet=true&amenities=wifi&amenities=parking`;
      const req = httpMock.expectOne((request) =>
        request.url.startsWith(`${environment.apiUrl}/properties`)
      );
      expect(req.request.method).toBe('GET');

      // Verify URL contains all search parameters
      const urlWithParams = req.request.urlWithParams;
      expect(urlWithParams).toContain('page=1');
      expect(urlWithParams).toContain('limit=10');
      expect(urlWithParams).toContain('city=Berlin');
      expect(urlWithParams).toContain('minPrice=800');
      expect(urlWithParams).toContain('maxPrice=1500');
      expect(urlWithParams).toContain('isSublet=true');
      expect(urlWithParams).toContain('amenities=wifi');
      expect(urlWithParams).toContain('amenities=parking');

      req.flush(mockResponse);
    });

    it('should handle sorting parameters correctly', () => {
      const searchParams: SearchParams = {
        sortBy: 'price_asc',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        pagination: { total: 2, limit: 10, page: 1 },
        properties: [
          {
            _id: '1',
            title: 'Property 1',
            description: 'Description 1',
            owner: 'user1',
            location: { city: 'Berlin' },
            price: 800,
            isAvailable: true,
            isSublet: false,
            reviews: { averageRating: 4.5, count: 10 },
            amenities: [],
            mediaPaths: [],
          },
          {
            _id: '2',
            title: 'Property 2',
            description: 'Description 2',
            owner: 'user2',
            location: { city: 'Hamburg' },
            price: 1200,
            isAvailable: true,
            isSublet: true,
            reviews: { averageRating: 4.0, count: 5 },
            amenities: [],
            mediaPaths: [],
          },
        ],
      };

      service.searchProperties(searchParams).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((request) =>
        request.url.startsWith(`${environment.apiUrl}/properties`)
      );
      expect(req.request.method).toBe('GET');

      // Verify URL contains correct sorting parameters
      const urlWithParams = req.request.urlWithParams;
      expect(urlWithParams).toContain('sortBy=price');
      expect(urlWithParams).toContain('sortOrder=asc');

      req.flush(mockResponse);
    });
  });

  describe('getAmenities', () => {
    it('should return a list of all available amenities', () => {
      const mockAmenities = [
        'wifi',
        'parking',
        'pool',
        'gym',
        'air conditioning',
      ];

      service.getAmenities().subscribe((amenities) => {
        expect(amenities).toEqual(mockAmenities);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/properties/amenities`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAmenities);
    });
  });

  describe('updateListing', () => {
    it('should send PUT request to update a property', () => {
      const mockFormData = new FormData();
      mockFormData.append('title', 'Updated Property');
      mockFormData.append('description', 'Updated description');
      mockFormData.append('owner', 'user123');
      mockFormData.append('location', JSON.stringify({ city: 'Berlin' }));
      mockFormData.append('price', '1100');
      mockFormData.append('isAvailable', 'true');
      mockFormData.append('isSublet', 'false');
      mockFormData.append(
        'reviews',
        JSON.stringify({ averageRating: 4.5, count: 10 })
      );
      mockFormData.append('amenities', JSON.stringify(['wifi']));
      mockFormData.append('mediaPaths', JSON.stringify([]));

      const mockResponse = { success: true };

      service.updateListing('123', mockFormData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toBe(mockFormData);
      req.flush(mockResponse);
    });
  });

  describe('searchListings', () => {
    it('should send GET request with query parameter', () => {
      const mockListings = [
        { id: '1', title: 'Berlin Apartment' },
        { id: '2', title: 'Berlin House' },
      ];

      service.searchListings('Berlin').subscribe((listings) => {
        expect(listings).toEqual(mockListings);
      });

      const req = httpMock.expectOne(`/api/listings?query=Berlin`);
      expect(req.request.method).toBe('GET');
      req.flush(mockListings);
    });
  });

  describe('getHeaders', () => {
    it('should include authorization header when token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue('test-token');

      // Call a method that uses getHeaders()
      service.getListings().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/properties`);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      expect(req.request.headers.get('Authorization')).toBe(
        'Bearer test-token'
      );
      req.flush({});
    });

    it('should not include authorization header when token does not exist', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      // Call a method that uses getHeaders()
      service.getListings().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/properties`);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });
  });
});
