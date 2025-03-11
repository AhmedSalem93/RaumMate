import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../../../shared/models/property.model';
import { User } from '../../../shared/models/user.model';
import { RatingComponentComponent } from '../rating-component/rating-component.component';
import { Rating } from '../../../shared/models/rating.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RatingComponentComponent,
    MatProgressSpinnerModule,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss',
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  id = '';
  property: Property | null = null;
  owner: User | null = null;
  currentImageIndex = 0;
  isLoading = true;
  error: string | null = null;
  isFavorite = false;
  dummyRatings: Rating[] = []; // Will be replaced with actual ratings

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      // console.log('Property ID:', params['id']);
      this.id = params['id'];
      this.fetchPropertyDetails();
    });
    // Generate some dummy ratings for now
    this.generateDummyRatings();
  }

  fetchPropertyDetails(): void {
    this.isLoading = true;

    this.propertyService.getListingById(this.id).subscribe({
      next: (data) => {
        console.log('Property data received:', data);
        this.property = data;
        // Handle owner information if it's populated
        if (typeof data.owner === 'object') {
          this.owner = data.owner as User;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching property details:', err);
        this.error = `Failed to load property details: ${
          err.message || 'Unknown error'
        }`;
        this.isLoading = false;
      },
    });
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    // TODO: Implement actual favorite functionality
  }

  sendMessage(): void {
    // TODO: Implement message functionality
    console.log('Send message to owner');
  }

  nextImage(): void {
    if (
      this.property &&
      this.property.mediaPaths &&
      this.property.mediaPaths.length > 0
    ) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.property.mediaPaths.length;
    }
  }

  prevImage(): void {
    if (
      this.property &&
      this.property.mediaPaths &&
      this.property.mediaPaths.length > 0
    ) {
      this.currentImageIndex =
        this.currentImageIndex === 0
          ? this.property.mediaPaths.length - 1
          : this.currentImageIndex - 1;
    }
  }

  getCurrentImage(): string {
    if (this.property?.mediaPaths && this.property.mediaPaths.length > 0) {
      return `${environment.apiUrl}${
        this.property.mediaPaths[this.currentImageIndex]
      }`;
    }
    return 'assets/images/placeholder-property.jpg'; // Fallback image
  }

  getOwnerInitials(): string {
    if (!this.owner) return 'U';
    const firstName = this.owner.firstName?.charAt(0) || '';
    const lastName = this.owner.lastName?.charAt(0) || '';
    return firstName + lastName;
  }

  getOwnerMemberSince(): string {
    if (!this.owner?.createdAt) return 'Unknown';
    const date = new Date(this.owner.createdAt);
    return `${date.toLocaleString('default', {
      month: 'long',
    })} ${date.getFullYear()}`;
  }

  // Temporary method to generate dummy ratings for display purposes
  private generateDummyRatings(): void {
    const dummyUser: User = {
      email: 'user@example.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      role: 'registered',
      isVerified: true,
    };

    this.dummyRatings = [
      {
        property: this.id,
        user: dummyUser,
        rating: 4,
        comment: 'Great location and very clean property!',
        createdAt: new Date(),
      },
      {
        property: this.id,
        user: dummyUser,
        rating: 5,
        comment: 'Excellent place, highly recommended!',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ];
  }
}
