import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { BookingService } from './booking.service';
import {
  Booking,
  BookingRequest,
  BookingStatus,
  StatusUpdateRequest,
} from '../../shared/models/booking.model';
import { environment } from '../../../environments/environment';

describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/bookings`;

  // Mock data for testing with explicit type declarations
  const mockBooking: Booking = {
    _id: '123',
    viewingDate: '2023-06-15T10:00:00Z',
    status: 'requested',
    message: 'I would like to view this property',
    createdAt: '2023-06-10T10:00:00Z',
    updatedAt: '2023-06-10T10:00:00Z',
    property: '456',
    requestedBy: '789',
    owner: '101',
  };

  // Define type-safe response creators
  const createMockResponse = (message: string, booking: Booking) => {
    return { message, booking };
  };

  const updateBookingStatus = (status: BookingStatus): Booking => {
    return {
      ...mockBooking,
      status: status,
    };
  };

  const mockBookings: Booking[] = [mockBooking];

  const mockBookingRequest: BookingRequest = {
    propertyId: '456',
    viewingDate: '2023-06-15T10:00:00Z',
    message: 'I would like to view this property',
  };

  const mockStatusUpdate: StatusUpdateRequest = {
    status: 'accepted',
    ownerNotes: 'Looking forward to meeting you',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService],
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a booking', () => {
    const mockResponse = createMockResponse(
      'Booking created successfully',
      mockBooking
    );

    service.createBooking(mockBookingRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    expect(req.request.body).toEqual(mockBookingRequest);

    req.flush(mockResponse);
  });

  it('should get bookings for the user as requester by default', () => {
    service.getBookings().subscribe((bookings) => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne(`${apiUrl}?role=requester`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.has('Authorization')).toBeTrue();

    req.flush(mockBookings);
  });

  it('should get bookings where user is the owner', () => {
    service.getBookings('owner').subscribe((bookings) => {
      expect(bookings).toEqual(mockBookings);
    });

    const req = httpMock.expectOne(`${apiUrl}?role=owner`);
    expect(req.request.method).toBe('GET');

    req.flush(mockBookings);
  });

  it('should get a booking by ID', () => {
    service.getBookingById('123').subscribe((booking) => {
      expect(booking).toEqual(mockBooking);
    });

    const req = httpMock.expectOne(`${apiUrl}/123`);
    expect(req.request.method).toBe('GET');

    req.flush(mockBooking);
  });

  it('should update booking status', () => {
    const updatedBooking = updateBookingStatus('accepted');
    const mockResponse = createMockResponse(
      'Status updated successfully',
      updatedBooking
    );

    service
      .updateBookingStatus('123', mockStatusUpdate)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(`${apiUrl}/123/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(mockStatusUpdate);

    req.flush(mockResponse);
  });

  it('should cancel a booking', () => {
    const cancelledBooking = updateBookingStatus('cancelled');
    const mockResponse = createMockResponse(
      'Booking cancelled',
      cancelledBooking
    );

    service.cancelBooking('123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/123/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'cancelled' });

    req.flush(mockResponse);
  });

  it('should accept a booking', () => {
    const acceptedBooking = updateBookingStatus('accepted');
    const mockResponse = createMockResponse(
      'Booking accepted',
      acceptedBooking
    );
    const notes = 'Looking forward to meeting you';

    service.acceptBooking('123', notes).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/123/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'accepted', ownerNotes: notes });

    req.flush(mockResponse);
  });

  it('should reject a booking', () => {
    const rejectedBooking = updateBookingStatus('rejected');
    const mockResponse = createMockResponse(
      'Booking rejected',
      rejectedBooking
    );
    const notes = 'Sorry, not available anymore';

    service.rejectBooking('123', notes).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/123/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'rejected', ownerNotes: notes });

    req.flush(mockResponse);
  });

  it('should mark a contract as done', () => {
    const contractDoneBooking = updateBookingStatus('contract_done');
    const mockResponse = createMockResponse(
      'Contract marked as done',
      contractDoneBooking
    );

    service.markContractDone('123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/123/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'contract_done' });

    req.flush(mockResponse);
  });

  it('should check if user lives in property', () => {
    service.LivesInProperty('456').subscribe((result) => {
      expect(result).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/livesInProperty/456`);
    expect(req.request.method).toBe('GET');

    req.flush(true);
  });

  it('should handle case when user is not authenticated', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    service.getBookings().subscribe();

    const req = httpMock.expectOne(`${apiUrl}?role=requester`);
    expect(req.request.headers.has('Authorization')).toBeFalse();

    req.flush(mockBookings);
  });
});
