import { Component, Input } from '@angular/core';
import { Property } from '../../../modules/property/property.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-property-card',
  imports: [MatCardModule, MatButtonModule, NgIf],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;

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
}
