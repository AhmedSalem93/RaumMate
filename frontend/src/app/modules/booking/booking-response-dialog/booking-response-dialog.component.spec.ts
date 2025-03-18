import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  BookingResponseDialogComponent,
  BookingResponseDialogData,
} from './booking-response-dialog.component';
import { FormsModule } from '@angular/forms';

describe('BookingResponseDialogComponent', () => {
  let component: BookingResponseDialogComponent;
  let fixture: ComponentFixture<BookingResponseDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<BookingResponseDialogComponent>>;

  const mockDialogData: BookingResponseDialogData = {
    action: 'accept',
    bookingId: '123',
    propertyTitle: 'Test Property',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        BookingResponseDialogComponent,
        NoopAnimationsModule,
        FormsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the correct title for accept action', () => {
    component.data = { ...mockDialogData, action: 'accept' };
    expect(component.getTitle()).toBe('Accept Booking Request');
  });

  it('should set the correct title for reject action', () => {
    component.data = { ...mockDialogData, action: 'reject' };
    expect(component.getTitle()).toBe('Reject Booking Request');
  });

  it('should return correct action text', () => {
    component.data = { ...mockDialogData, action: 'accept' };
    expect(component.getActionText()).toBe('Accept');

    component.data = { ...mockDialogData, action: 'reject' };
    expect(component.getActionText()).toBe('Reject');
  });

  it('should return correct action color', () => {
    component.data = { ...mockDialogData, action: 'accept' };
    expect(component.getActionColor()).toBe('primary');

    component.data = { ...mockDialogData, action: 'reject' };
    expect(component.getActionColor()).toBe('warn');
  });

  it('should close dialog with confirmed=false when cancel is clicked', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalledWith({
      confirmed: false,
      bookingId: mockDialogData.bookingId,
    });
  });

  it('should close dialog with confirmed=true and notes when confirm is clicked', () => {
    component.notes = 'Test notes';
    component.onConfirm();
    expect(dialogRef.close).toHaveBeenCalledWith({
      confirmed: true,
      bookingId: mockDialogData.bookingId,
      notes: 'Test notes',
    });
  });
});
