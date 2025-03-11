import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  isDownloading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ImagePreviewData,
    private dialogRef: MatDialogRef<ImagePreviewComponent>,
    private snackBar: MatSnackBar
  ) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
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

  async downloadImage(): Promise<void> {
    if (this.isDownloading) return;

    try {
      this.isDownloading = true;
      const filename =
        this.getFilenameFromUrl(this.data.imageUrl) ||
        this.data.title ||
        'image';

      // Try to use fetch API to handle potential CORS issues
      const response = await fetch(this.data.imageUrl);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      this.snackBar.open('Image downloaded successfully', 'Close', {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      this.snackBar.open(
        'Failed to download image. Please try again later.',
        'Close',
        {
          duration: 5000,
        }
      );
    } finally {
      this.isDownloading = false;
    }
  }

  private getFilenameFromUrl(url: string): string | null {
    try {
      const urlPath = new URL(url).pathname;
      const segments = urlPath.split('/');
      const lastSegment = segments[segments.length - 1];

      // If the last segment has a file extension, use it as the filename
      if (lastSegment && /\.\w+$/.test(lastSegment)) {
        return lastSegment;
      }
      return null;
    } catch {
      return null;
    }
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
