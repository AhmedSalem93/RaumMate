import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface BookingResponseDialogData {
  action: 'accept' | 'reject';
  bookingId: string;
  propertyTitle: string;
}

export interface BookingResponseDialogResult {
  confirmed: boolean;
  notes?: string;
  bookingId: string;
}

@Component({
  selector: 'app-booking-response-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './booking-response-dialog.component.html',
  styleUrls: ['./booking-response-dialog.component.scss'],
})
export class BookingResponseDialogComponent {
  notes: string = '';

  constructor(
    public dialogRef: MatDialogRef<BookingResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingResponseDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close({ confirmed: false, bookingId: this.data.bookingId });
  }

  onConfirm(): void {
    console.log(
      `Dialog confirming ${this.data.action} for booking: ${this.data.bookingId}`
    );
    console.log(`Notes: ${this.notes}`);

    const result: BookingResponseDialogResult = {
      confirmed: true,
      bookingId: this.data.bookingId,
      notes: this.notes,
    };

    console.log('Returning result from dialog:', result);
    this.dialogRef.close(result);
  }

  getTitle(): string {
    return this.data.action === 'accept'
      ? 'Accept Booking Request'
      : 'Reject Booking Request';
  }

  getActionText(): string {
    return this.data.action === 'accept' ? 'Accept' : 'Reject';
  }

  getActionColor(): string {
    return this.data.action === 'accept' ? 'primary' : 'warn';
  }
}
