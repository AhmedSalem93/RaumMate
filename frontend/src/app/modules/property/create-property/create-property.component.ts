import { Component, OnInit, inject } from '@angular/core';
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

  // Google Maps configuration
  mapsOptions: google.maps.MapOptions = {
    center: { lat: 52.520008, lng: 13.404954 }, // Default to Berlin
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: 'b1b1b1b1b1b1b1b1',
  };

  markerPosition: google.maps.LatLngLiteral = {
    lat: 52.520008,
    lng: 13.404954,
  };

  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
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

  selectedMedia: File[] = [];
  mediaPreviewUrls: string[] = [];

  ngOnInit(): void {
    // Check for browser's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.markerPosition = pos;
          this.mapsOptions = {
            ...this.mapsOptions,
            center: pos,
          };
          this.basicInfoForm.get('location.coordinates')?.patchValue({
            lat: pos.lat,
            lng: pos.lng,
          });
        },
        () => {
          // Handle geolocation error - use default values
          console.log('Geolocation service failed.');
        }
      );
    }
  }

  // Handle marker position update when marker is dragged
  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.markerPosition = pos;
      this.basicInfoForm.get('location.coordinates')?.patchValue({
        lat: pos.lat,
        lng: pos.lng,
      });
    }
  }

  // Set marker position when user clicks on map
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      this.markerPosition = pos;
      this.basicInfoForm.get('location.coordinates')?.patchValue({
        lat: pos.lat,
        lng: pos.lng,
      });
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
        this.selectedMedia.push(file);
        const reader = new FileReader();
        reader.onload = (e) =>
          this.mediaPreviewUrls.push(e.target?.result?.toString() || '');
        reader.readAsDataURL(file);
      }
    }
    target.value = '';
  }

  removeMedia(index: number): void {
    this.selectedMedia.splice(index, 1);
    this.mediaPreviewUrls.splice(index, 1);
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
    console.log('Form submitted');
    event?.preventDefault(); // stops any default page reload
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

      this.amenitiesList.forEach((amenity) =>
        formData.append('amenities', amenity)
      );
      this.selectedMedia.forEach((media) => formData.append('media', media));

      console.log('Form submitted:', formData);

      this.propertyService.createListing(formData).subscribe(
        (response) => {
          this.snackBar.open(
            'Property listing created successfully!',
            'Close',
            {
              duration: 3000,
            }
          );
          this.resetForm();
        },
        (error) => {
          console.error('Error creating property listing:', error);
          this.snackBar.open(
            'Error creating property listing' + error.message,
            'Close',
            {
              duration: 3000,
            }
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
    this.selectedMedia = [];
    this.mediaPreviewUrls = [];
    this.amenitiesList = [];
    // Reset map to default position
    this.markerPosition = { lat: 52.520008, lng: 13.404954 };
    this.mapsOptions = {
      ...this.mapsOptions,
      center: this.markerPosition,
    };
  }
}
