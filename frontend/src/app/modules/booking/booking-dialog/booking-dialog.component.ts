import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { BookingRequest } from '../../../shared/models/booking.model';
import { Property } from '../../../shared/models/property.model';

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrl: './booking-dialog.component.scss',
})
export class BookingDialogComponent {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private dialogRef = inject(MatDialogRef<BookingDialogComponent>);
  private snackBar = inject(MatSnackBar);

  property: Property;
  bookingForm = this.fb.group({
    viewingDate: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { property: Property }) {
    this.property = data.property;
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.isLoading = true;

      const bookingRequest: BookingRequest = {
        propertyId: this.property._id!,
        viewingDate: this.bookingForm.value.viewingDate!,
        message: this.bookingForm.value.message!,
      };

      this.bookingService.createBooking(bookingRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Booking request sent successfully', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error creating booking:', error);
          this.snackBar.open(
            `Failed to create booking: ${error.message || 'Unknown error'}`,
            'Close',
            { duration: 5000 }
          );
        },
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
