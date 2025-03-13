import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { PropertyService } from '../../../core/services/property.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment';

interface MediaItem {
  url: string;
  file?: File;
  type: 'image' | 'video' | 'other';
}

@Component({
  selector: 'app-create-property',
  templateUrl: './create-property.component.html',
  styleUrls: ['./create-property.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatChipsModule,
    GoogleMapsModule,
  ],
})
export class CreatePropertyComponent implements OnInit {
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);
  propertyService = inject(PropertyService);
  route = inject(ActivatedRoute);
  editMode = false;
  propertyId: string | null = null;

  // Google Maps configuration
  mapsOptions: google.maps.MapOptions = {
    center: { lat: 52.520008, lng: 13.404954 }, // Default to Berlin
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: 'b1b1b1b1b1b1b1bqq1',
  };

  markerPosition: google.maps.LatLngLiteral = {
    lat: 52.520008,
    lng: 13.404954,
  };

  private subletDatesValidator(formGroup: FormGroup) {
    const isSublet = formGroup.get('isSublet')?.value;
    const start = formGroup.get('subletDates.start')?.value;
    const end = formGroup.get('subletDates.end')?.value;
    if (isSublet && (!start || !end)) {
      return { subletDatesRequired: true };
    }
    return null;
  }

  basicInfoForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    price: [0.0, [Validators.required, Validators.min(1)]],
    isSublet: [false],

    subletDates: this.fb.group({
      start: [''],
      end: [''],
    }),

    location: this.fb.group({
      city: ['', Validators.required],
      address: [''],
      coordinates: this.fb.group({
        lat: [52.520008],
        lng: [13.404954],
      }),
    }),
  });

  amenityControl = new FormControl('');
  amenitiesList: string[] = [];
  mediaItems: MediaItem[] = [];

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.editMode = true;
        this.propertyId = params['id'];
        this.loadPropertyData();
      } else {
        // Only use geolocation when creating a new property
        this.initializeGeolocation();
      }
    });
  }

  // Move geolocation initialization to a separate method
  private initializeGeolocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.updateMarkerPosition(pos);
        },
        () => {
          // Handle geolocation error - use default values
          console.log('Geolocation service failed.');
        }
      );
    }
  }

  // Create a helper method to update the marker position and form values
  private updateMarkerPosition(pos: google.maps.LatLngLiteral): void {
    this.markerPosition = pos;
    this.mapsOptions = {
      ...this.mapsOptions,
      center: pos,
    };
    this.basicInfoForm.get('location.coordinates')?.patchValue({
      lat: pos.lat,
      lng: pos.lng,
    });
  }

  private loadPropertyData(): void {
    if (this.propertyId) {
      this.propertyService.getListingById(this.propertyId).subscribe(
        (property) => {
          this.basicInfoForm.patchValue({
            title: property.title,
            description: property.description,
            price: property.price,
            isSublet: property.isSublet,
            subletDates: {
              start: property.subletDates?.start,
              end: property.subletDates?.end,
            },
            location: {
              city: property.location.city,
              address: property.location.address,
              coordinates: {
                lat: property.location?.coordinates?.lat,
                lng: property.location?.coordinates?.lng,
              },
            },
          });

          // Set marker position if coordinates exist
          if (property.location?.coordinates) {
            const pos = {
              lat: property.location.coordinates.lat ?? 52.520008,
              lng: property.location.coordinates.lng ?? 13.404954,
            };
            this.updateMarkerPosition(pos);
          }

          // Set amenities
          this.amenitiesList = property.amenities || [];

          // Handle existing media
          if (property.mediaPaths && property.mediaPaths.length > 0) {
            // Convert existing media paths to MediaItem objects

            property.mediaPaths.forEach((path) => {
              const url = environment.apiUrl + path;
              const type = this.getMediaType(url);
              fetch(url)
                .then((res) => res.blob())
                .then((blob) => {
                  const file = new File(
                    [blob],
                    path.split('/').pop() || 'media',
                    { type: blob.type }
                  );
                  this.mediaItems.push({ url, file, type });
                });
            });
          }
        },
        (error) => {
          this.snackBar.open('Error loading property data', 'Close', {
            duration: 3000,
          });
        }
      );
    }
  }

  // Determine media type from URL or file extension
  private getMediaType(url: string): 'image' | 'video' | 'other' {
    if (
      url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
      url.startsWith('data:image/')
    ) {
      return 'image';
    } else if (
      url.match(/\.(mp4|webm|ogg|mov)$/i) ||
      url.startsWith('data:video/')
    ) {
      return 'video';
    } else {
      return 'other';
    }
  }

  // Handle marker position update when marker is dragged
  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.updateMarkerPosition(pos);
    }
  }

  // Set marker position when user clicks on map
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.updateMarkerPosition(pos);
    }
  }

  onMediaSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 100 * 1024 * 1024) {
          this.snackBar.open('Media must be < 100MB', 'Close', {
            duration: 3000,
          });
          continue;
        }

        // Create a local URL for preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result?.toString() || '';
          const type = file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : 'other';

          this.mediaItems.push({ url, file, type });
        };
        reader.readAsDataURL(file);
      }
    }
    target.value = '';
  }

  removeMedia(index: number): void {
    this.mediaItems.splice(index, 1);
  }

  addAmenity(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    console.log('Amenity added:', value);
    // Add our keyword
    if (value) {
      this.amenitiesList.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeAmenity(amenity: string): void {
    const index = this.amenitiesList.indexOf(amenity);
    if (index >= 0) {
      this.amenitiesList.splice(index, 1);
    }
  }

  onSubmit(event?: Event): void {
    event?.preventDefault();
    if (this.basicInfoForm.valid) {
      const formData = new FormData();
      formData.append('title', this.basicInfoForm.get('title')?.value || '');

      formData.append(
        'description',
        this.basicInfoForm.get('description')?.value || ''
      );
      formData.append(
        'price',
        this.basicInfoForm.get('price')?.value?.toString() || ''
      );
      formData.append(
        'isSublet',
        this.basicInfoForm.get('isSublet')?.value === true ? 'true' : 'false'
      );
      formData.append(
        'subletDates.start',
        this.basicInfoForm.get('subletDates.start')?.value || ''
      );
      formData.append(
        'subletDates.end',
        this.basicInfoForm.get('subletDates.end')?.value || ''
      );
      formData.append(
        'location.city',
        this.basicInfoForm.get('location.city')?.value || ''
      );
      formData.append(
        'location.address',
        this.basicInfoForm.get('location.address')?.value || ''
      );

      // Add coordinates to the form data
      formData.append(
        'location.coordinates.lat',
        this.basicInfoForm.get('location.coordinates.lat')?.value?.toString() ||
          ''
      );
      formData.append(
        'location.coordinates.lng',
        this.basicInfoForm.get('location.coordinates.lng')?.value?.toString() ||
          ''
      );

      // Add all media files
      this.mediaItems.forEach((item) => {
        if (item.file) {
          formData.append('media', item.file);
        }
      });

      // Add amenities
      this.amenitiesList.forEach((amenity) =>
        formData.append('amenities', amenity)
      );

      const request$ =
        this.editMode && this.propertyId
          ? this.propertyService.updateListing(this.propertyId, formData)
          : this.propertyService.createListing(formData);

      request$.subscribe(
        (response) => {
          this.snackBar.open(
            `Property listing ${
              this.editMode ? 'updated' : 'created'
            } successfully!`,
            'Close',
            { duration: 3000 }
          );
          if (!this.editMode) {
            this.resetForm();
          }
        },
        (error) => {
          console.error(
            `Error ${
              this.editMode ? 'updating' : 'creating'
            } property listing:`,
            error
          );
          this.snackBar.open(
            `Error ${
              this.editMode ? 'updating' : 'creating'
            } property listing: ${error.message}`,
            'Close',
            { duration: 3000 }
          );
        }
      );
    } else {
      this.basicInfoForm.markAllAsTouched();
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
      });
    }
  }

  resetForm() {
    this.basicInfoForm.reset();
    this.mediaItems = [];
    this.amenitiesList = [];
    // Reset map to default position
    this.markerPosition = { lat: 52.520008, lng: 13.404954 };
    this.mapsOptions = {
      ...this.mapsOptions,
      center: this.markerPosition,
    };
  }
}
