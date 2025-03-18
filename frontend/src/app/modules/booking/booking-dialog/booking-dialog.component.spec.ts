import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingDialogComponent } from './booking-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../core/services/booking.service';
import { of, throwError } from 'rxjs';
import { Property } from '../../../shared/models/property.model';

describe('BookingDialogComponent', () => {
  let component: BookingDialogComponent;
  let fixture: ComponentFixture<BookingDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<BookingDialogComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockBookingService: jasmine.SpyObj<BookingService>;

  const mockProperty: Property = {
    _id: '123',
    title: 'Test Property',
    description: 'Test Description',
    price: 1000,
    location: {
      address: '123 Test St',
      city: 'Test City',
    },
    isAvailable: true,
    isSublet: true,
    owner: '456',
    subletDates: {
      start: new Date().toISOString(),
      end: new Date(
        new Date().setMonth(new Date().getMonth() + 3)
      ).toISOString(),
    },
    reviews: {
      averageRating: 4.5,
      count: 10,
    },
    amenities: ['WiFi', 'Parking'],
    mediaPaths: ['image1.jpg'],
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockBookingService = jasmine.createSpyObj('BookingService', [
      'createBooking',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        BookingDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { property: mockProperty } },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: BookingService, useValue: mockBookingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the provided property', () => {
    expect(component.property).toBe(mockProperty);
  });

  it('should have an invalid form initially', () => {
    expect(component.bookingForm.valid).toBeFalse();
  });

  it('should validate form when values are correct', () => {
    component.bookingForm.patchValue({
      viewingDate: new Date().toISOString(),
      message: 'This is a test message with more than 10 characters',
    });
    expect(component.bookingForm.valid).toBeTrue();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should handle errors during booking submission', () => {
    const errorMessage = 'Test error message';

    mockBookingService.createBooking.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    component.bookingForm.patchValue({
      viewingDate: new Date().toISOString(),
      message: 'This is a test booking message',
    });

    component.onSubmit();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Failed to create booking: ${errorMessage}`,
      'Close',
      { duration: 5000 }
    );
  });
});
