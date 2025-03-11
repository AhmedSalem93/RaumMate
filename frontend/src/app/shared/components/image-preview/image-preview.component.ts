import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ImagePreviewData {
  imageUrl: string;
  title?: string;
}

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss'],
 
})
export class ImagePreviewComponent {
  scale = 1;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ImagePreviewData,
    private dialogRef: MatDialogRef<ImagePreviewComponent>
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch(event.key) {
      case 'Escape':
        this.closeDialog();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      case '0':
        this.resetZoom();
        break;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.data.imageUrl;
    link.download = this.data.title || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  zoomIn(): void {
    if (this.scale < 3) {
      this.scale *= 1.5;
    }
  }

  zoomOut(): void {
    if (this.scale > 0.5) {
      this.scale /= 1.5;
      if (this.scale === 1) {
        this.resetZoom();
      }
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  startPan(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    }
  }

  pan(event: MouseEvent): void {
    if (this.isPanning && this.scale > 1) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
    }
  }

  endPan(): void {
    this.isPanning = false;
  }

  getImageTransform(): string {
    return `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }
} 