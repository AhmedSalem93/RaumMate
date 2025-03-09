import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Property } from '../../../modules/property/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import {
  CurrencyPipe,
  NgIf,
  NgClass,
  SlicePipe,
  DatePipe,
} from '@angular/common';

@Component({
  selector: 'app-property-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    NgIf,
    CurrencyPipe,
    SlicePipe,
    DatePipe,
    MatIconModule,
  ],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() favorite = new EventEmitter<{ id: string; value: boolean }>();

  isFavorite = false;
  isOnline = false;
  ownerAvatar = 'https://avatar.iran.liara.run/public/48';

  constructor() {}

  isImgUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|webp|avif|gif|bmp|tiff|tif|svg|heif|heic)$/i.test(
      url
    );
  }

  get firstImageUrl(): string {
    for (const mediaPath of this.property.mediaPaths) {
      if (this.isImgUrl(mediaPath)) {
        console.log('mediaPath', mediaPath);
        return `${environment.apiUrl}${mediaPath}`;
      }
    }
    return 'https://placehold.co/400x400';
  }

  get displayAmenities(): string {
    if (!this.property.amenities || this.property.amenities.length === 0) {
      return '';
    }

    // Show first 3 amenities with ellipsis if there are more
    if (this.property.amenities.length > 3) {
      return this.property.amenities.slice(0, 3).join(', ') + '...';
    }

    return this.property.amenities.join(', ');
  }

  getRoomCount(): number {
    // Extract number from title or return default
    const match = this.property.title.match(/(\d+)[-\s]?Zi/i);
    return match ? parseInt(match[1]) : 1;
  }

  getOwnerName(): string {
    if (typeof this.property.owner === 'string') {
      return '';
    }
    return (this.property.owner as any).name || '';
  }

  getOnlineStatus(): string {
    // Implement actual online status logic here
    return this.isOnline ? 'Online now' : 'Online: 9 hours ago';
  }

  getFormattedCreatedAt(): string {
    if (!this.property.createdAt) return '';
    const date = new Date(this.property.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.favorite.emit({ id: this.property._id!, value: this.isFavorite });
  }
}
