import { Component, Input } from '@angular/core';
import { Rating } from '../../../shared/models/rating.model';
import { NgFor, DatePipe } from '@angular/common';
import { User } from '../../../shared/models/user.model';
import { MatIconModule } from '@angular/material/icon';
import { InputModalityDetector } from '@angular/cdk/a11y';

@Component({
  selector: 'app-rating-component',
  standalone: true,
  imports: [NgFor, MatIconModule, DatePipe],
  templateUrl: './rating-component.component.html',
  styleUrl: './rating-component.component.scss',
})
export class RatingComponentComponent {
  @Input({
    required: true,
  })
  userRating!: Rating;
  getUserFirstName(user: any): string {
    return user?.firstName || 'Anonymous';
  }

  getUserLastName(user: any): string {
    return user?.lastName || '';
  }

  getUserInitials(user: any): string {
    if (!user) return 'U';
    const firstName = user.firstName?.charAt(0) || '';
    const lastName = user.lastName?.charAt(0) || '';
    return firstName + lastName || 'U';
  }

  getUserAvatar(user: any): string {
    return user?.profilePicture || '';
  }

  isValidUser(user: any): boolean {
    return user && typeof user === 'object';
  }

  isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  getFormattedDate(date: any): Date | null {
    return this.isValidDate(date) ? date : null;
  }

  // Fake rating object for testing
}
