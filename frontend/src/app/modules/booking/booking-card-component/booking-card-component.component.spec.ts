import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingCardComponentComponent } from './booking-card-component.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../shared/models/booking.model';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { BookingResponseDialogComponent } from '../booking-response-dialog/booking-response-dialog.component';

describe('BookingCardComponentComponent', () => {
  let component: BookingCardComponentComponent;
  let fixture: ComponentFixture<BookingCardComponentComponent>;
  let bookingService: jasmine.SpyObj<BookingService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  // Mock data
  const mockUser: User = {
    _id: 'user123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'registered',
    isVerified: true,
  };

  const mockOwner: User = {
    _id: 'owner123',
    email: 'owner@example.com',
    firstName: 'Property',
    lastName: 'Owner',
    role: 'propertyOwner',
    isVerified: true,
  };

  const mockProperty: Property = {
    _id: 'prop123',
    title: 'Cozy Apartment',
    description: 'A lovely apartment in the city',
    owner: 'owner123',
    location: {
      city: 'Berlin',
      address: '123 Main St',
    },
    price: 1200,
    isAvailable: true,
    isSublet: false,
    reviews: {
      averageRating: 4.5,
      count: 10,
    },
    amenities: ['wifi', 'parking'],
    mediaPaths: ['/images/apartment1.jpg', '/images/apartment2.jpg'],
  };

  const mockBooking: Booking = {
    _id: 'booking123',
    viewingDate: new Date('2023-06-15'),
    status: 'requested',
    message: 'I would like to view this property',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10'),
    property: mockProperty,
    requestedBy: mockUser,
    owner: mockOwner,
  };

  beforeEach(async () => {
    // Create spies for services
    const bookingServiceSpy = jasmine.createSpyObj('BookingService', [
      'acceptBooking',
      'rejectBooking',
      'cancelBooking',
      'markContractDone',
    ]);

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        BookingCardComponentComponent,
        MatDialogModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCardComponentComponent);
    component = fixture.componentInstance;
    bookingService = TestBed.inject(
      BookingService
    ) as jasmine.SpyObj<BookingService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    // Setup component with mock data
    component.booking = { ...mockBooking };
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Role determination', () => {
    it('should identify when user is the owner', () => {
      component.userId = 'owner123';
      fixture.detectChanges();
      expect(component.isOwner()).toBeTrue();
      expect(component.isRequester()).toBeFalse();
    });

    it('should identify when user is the requester', () => {
      component.userId = 'user123';
      fixture.detectChanges();
      expect(component.isRequester()).toBeTrue();
      expect(component.isOwner()).toBeFalse();
    });

    it('should handle string IDs for owner/requester', () => {
      component.booking.owner = 'owner123';
      component.booking.requestedBy = 'user123';
      component.userId = 'owner123';
      fixture.detectChanges();
      expect(component.isOwner()).toBeTrue();

      component.userId = 'user123';
      expect(component.isRequester()).toBeTrue();
    });
  });

  describe('Status display', () => {
    it('should return correct status class', () => {
      component.booking.status = 'requested';
      expect(component.getStatusClass()).toBe('status-requested');

      component.booking.status = 'accepted';
      expect(component.getStatusClass()).toBe('status-accepted');

      component.booking.status = 'rejected';
      expect(component.getStatusClass()).toBe('status-rejected');

      component.booking.status = 'in_progress';
      expect(component.getStatusClass()).toBe('status-in-progress');

      component.booking.status = 'contract_done';
      expect(component.getStatusClass()).toBe('status-contract-done');
    });

    it('should format status text properly', () => {
      component.booking.status = 'requested';
      expect(component.getStatusText()).toBe('Requested');

      component.booking.status = 'in_progress';
      expect(component.getStatusText()).toBe('In Progress');

      component.booking.status = 'contract_done';
      expect(component.getStatusText()).toBe('Contract Done');
    });
  });

  describe('Property information display', () => {
    it('should return property title', () => {
      expect(component.getPropertyTitle()).toBe('Cozy Apartment');

      component.booking.property = 'prop123';
      expect(component.getPropertyTitle()).toBe(
        'Property details not available'
      );
    });

    it('should return property location', () => {
      expect(component.getPropertyLocation()).toBe('Berlin');

      component.booking.property = 'prop123';
      expect(component.getPropertyLocation()).toBe('Location not available');
    });

    it('should get property ID for routing', () => {
      expect(component.getPropertyId()).toBe('prop123');

      component.booking.property = 'prop123';
      expect(component.getPropertyId()).toBe('prop123');

      component.booking.property = undefined;
      expect(component.getPropertyId()).toBe('');
    });

    it('should construct property image URL', () => {
      spyOn(component, 'isImgUrl').and.returnValue(true);
      expect(component.getPropertyImage()).toContain('/images/apartment1.jpg');

      component.booking.property = 'prop123';
      expect(component.getPropertyImage()).toBe(
        component.propertyImageFallback
      );
    });
  });

  describe('User information display', () => {
    it('should return requester name', () => {
      expect(component.getRequesterName()).toBe('John Doe');

      component.booking.requestedBy = 'user123';
      expect(component.getRequesterName()).toBe('Unknown User');
    });

    it('should return owner name', () => {
      expect(component.getOwnerName()).toBe('Property Owner');

      component.booking.owner = 'owner123';
      expect(component.getOwnerName()).toBe('Property Owner');
    });
  });

  describe('Permission checks', () => {
    it('should determine if booking can be processed', () => {
      component.booking.status = 'requested';
      expect(component.canProcessBooking()).toBeTrue();

      component.booking.status = 'accepted';
      expect(component.canProcessBooking()).toBeFalse();
    });

    it('should determine if booking can be cancelled', () => {
      component.booking.status = 'requested';
      expect(component.canCancelBooking()).toBeTrue();

      component.booking.status = 'in_progress';
      expect(component.canCancelBooking()).toBeTrue();

      component.booking.status = 'rejected';
      expect(component.canCancelBooking()).toBeFalse();
    });

    it('should determine if booking can be marked as contract done', () => {
      component.booking.status = 'accepted';
      expect(component.canMarkContractDone()).toBeTrue();

      component.booking.status = 'requested';
      expect(component.canMarkContractDone()).toBeFalse();
    });
  });

  describe('Utility methods', () => {
    it('should detect image URLs', () => {
      expect(component.isImgUrl('test.jpg')).toBeTrue();
      expect(component.isImgUrl('test.png')).toBeTrue();
      expect(component.isImgUrl('test.txt')).toBeFalse();
    });

    it('should build API URL for images', () => {
      const testPath = '/images/test.jpg';
      expect(component.getPropImageURL(testPath)).toEqual(
        `${environment.apiUrl}${testPath}`
      );
    });
  });
});
