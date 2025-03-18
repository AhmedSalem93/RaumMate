import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BookingListComponent } from './booking-list.component';
import { BookingService } from '../../../core/services/booking.service';
import { UserService } from '../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Booking, BookingStatus } from '../../../shared/models/booking.model';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../shared/models/user.model';
import { Property } from '../../../shared/models/property.model';
import { ActivatedRoute } from '@angular/router';

// Mock BookingCardComponent - mark it as standalone
@Component({
  selector: 'app-booking-card-component',
  template: '<div>Mock Booking Card</div>',
  standalone: true,
})
class MockBookingCardComponent {
  @Input() booking!: Booking;
  @Input() userId!: string;
  @Output() bookingUpdated = new EventEmitter<{
    action: string;
    booking: Booking;
  }>();
  @Output() actionError = new EventEmitter<{ action: string; error: any }>();
}

describe('BookingListComponent', () => {
  let component: BookingListComponent;
  let fixture: ComponentFixture<BookingListComponent>;
  let mockBookingService: jasmine.SpyObj<BookingService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  // Mock ActivatedRoute with the required properties/methods
  const mockActivatedRoute = {
    paramMap: of(new Map()),
    queryParamMap: of(new Map()),
    snapshot: {
      paramMap: {
        get: (key: string) => null,
      },
      queryParamMap: {
        get: (key: string) => null,
      },
    },
  };

  // Sample data for tests
  const mockUser: User = {
    _id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'registered',
    isVerified: true,
  };

  const mockProperty: Property = {
    _id: 'prop123',
    title: 'Test Property',
    description: 'A test property',
    owner: 'owner123',
    location: { city: 'Test City' },
    price: 1000,
    isAvailable: true,
    isSublet: false,
    reviews: { averageRating: 4.5, count: 10 },
    amenities: ['wifi', 'parking'],
    mediaPaths: [],
  };

  const mockBookings: Booking[] = [
    {
      _id: 'booking1',
      viewingDate: new Date().toISOString(),
      status: 'requested' as BookingStatus,
      message: 'I would like to view this property',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      property: mockProperty,
      requestedBy: mockUser,
      owner: { ...mockUser, _id: 'owner123' },
    },
    {
      _id: 'booking2',
      viewingDate: new Date().toISOString(),
      status: 'accepted' as BookingStatus,
      message: 'Another booking request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      property: mockProperty,
      requestedBy: mockUser,
      owner: { ...mockUser, _id: 'owner123' },
    },
  ];

  beforeEach(async () => {
    mockBookingService = jasmine.createSpyObj('BookingService', [
      'getBookings',
    ]);
    mockUserService = jasmine.createSpyObj('UserService', ['getProfile']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        BookingListComponent,
        MatTabsModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        MockBookingCardComponent,
      ],
      providers: [
        { provide: BookingService, useValue: mockBookingService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }, // Add this provider
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load user profile and bookings on initialization', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings
      .withArgs('requester')
      .and.returnValue(of(mockBookings));
    mockBookingService.getBookings.withArgs('owner').and.returnValue(of([]));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Verify user profile was loaded
    expect(mockUserService.getProfile).toHaveBeenCalled();
    expect(component.currentUserId).toBe('user123');

    // Verify bookings were loaded
    expect(mockBookingService.getBookings).toHaveBeenCalledWith('requester');
    expect(mockBookingService.getBookings).toHaveBeenCalledWith('owner');
    expect(component.myBookings).toEqual(mockBookings);
    expect(component.receivedBookings).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeFalse();
  }));

  it('should handle error when loading user profile', fakeAsync(() => {
    // Setup error when getting profile
    mockUserService.getProfile.and.returnValue(
      throwError(() => new Error('Profile error'))
    );

    // Initialize component
    fixture.detectChanges();
    tick();

    // Verify error state
    expect(component.error).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(mockBookingService.getBookings).not.toHaveBeenCalled();
  }));

  it('should handle error when loading requester bookings', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings
      .withArgs('requester')
      .and.returnValue(throwError(() => new Error('Booking error')));
    mockBookingService.getBookings.withArgs('owner').and.returnValue(of([]));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Verify error handling
    expect(component.error).toBeTrue();
    expect(component.myBookings).toEqual([]);
    // Owner bookings should still be loaded
    expect(mockBookingService.getBookings).toHaveBeenCalledWith('owner');
  }));

  it('should handle error when loading owner bookings', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings
      .withArgs('requester')
      .and.returnValue(of(mockBookings));
    mockBookingService.getBookings
      .withArgs('owner')
      .and.returnValue(throwError(() => new Error('Owner bookings error')));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Verify error handling
    expect(component.error).toBeTrue();
    expect(component.myBookings).toEqual(mockBookings);
    expect(component.loading).toBeFalse();
  }));

  it('should handle booking updates successfully', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings.and.returnValue(of(mockBookings));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Reset the spy counts
    mockBookingService.getBookings.calls.reset();

    // Simulate booking update
    const updateEvent = { action: 'accept', booking: mockBookings[0] };
    component.handleBookingUpdated(updateEvent);

    // Verify snackbar was shown and bookings were reloaded
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Booking accepted successfully',
      'Close',
      { duration: 3000 }
    );
    expect(mockBookingService.getBookings).toHaveBeenCalledWith('requester');
    expect(mockBookingService.getBookings).toHaveBeenCalledWith('owner');
  }));

  it('should handle action errors', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings.and.returnValue(of(mockBookings));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Simulate action error
    const errorEvent = { action: 'accept', error: new Error('Test error') };
    component.handleActionError(errorEvent);

    // Verify snackbar was shown with error message
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Failed to accept booking',
      'Close',
      { duration: 3000 }
    );
  }));

  it('should show different messages for different booking actions', fakeAsync(() => {
    // Setup mocks
    mockUserService.getProfile.and.returnValue(of(mockUser));
    mockBookingService.getBookings.and.returnValue(of(mockBookings));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Test different actions
    const actions = [
      { action: 'accept', message: 'Booking accepted successfully' },
      { action: 'reject', message: 'Booking rejected' },
      { action: 'cancel', message: 'Booking cancelled' },
      { action: 'contract_done', message: 'Booking marked as Contract Done' },
    ];

    actions.forEach(({ action, message }) => {
      mockSnackBar.open.calls.reset();
      component.handleBookingUpdated({ action, booking: mockBookings[0] });
      expect(mockSnackBar.open).toHaveBeenCalledWith(message, 'Close', {
        duration: 3000,
      });
    });
  }));
});
