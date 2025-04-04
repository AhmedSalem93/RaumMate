import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import { SharedModule } from '../../../shared/shared.module';
import { PropertyListComponent } from '../property-list/property-list.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { Property } from '../../../shared/models/property.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    PropertyListComponent,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDatepickerModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  properties: Property[] = [];
  currentPage = 1;
  totalItems = 0;
  itemsPerPage = 10;
  amenitiesList: string[] = []; // Will be loaded from backend
  isLoading = false; // Added loading state variable

  sortOptions = [
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'rating_desc', label: 'Rating (High to Low)' },
  ];

  fb = inject(FormBuilder);
  propertyService = inject(PropertyService);

  searchForm = this.fb.group({
    city: [''],
    minPrice: [0],
    maxPrice: [5000],
    isSublet: [false],
    amenities: [[] as string[]], // Initialize as empty string array
    subletStartDate: [''],
    subletEndDate: [''],
    sortBy: ['date_desc'],
  });
  constructor() {
    this.loadAmenities();
  }
  ngOnInit() {
    // Load available amenities

    this.searchForm.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1; // Reset to first page on new search
        this.search();
      });

    this.search();
  }

  loadAmenities() {
    this.isLoading = true;
    this.propertyService.getAmenities().subscribe({
      next: (amenities) => {
        this.amenitiesList = amenities;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading amenities:', error);
        // Fallback to defaults if API call fails
        this.amenitiesList = [
          'Balcony',
          'Pool',
          'Gym',
          'Parking',
          'Pet Friendly',
        ];
        this.isLoading = false;
      },
    });
  }

  search() {
    const formValue = this.searchForm.value;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    // Only add non-empty values to params
    if (formValue.city && formValue.city.trim() !== '') {
      params.city = formValue.city.trim();
    }

    if (formValue.minPrice && formValue.minPrice > 0) {
      params.minPrice = formValue.minPrice;
    }

    if (formValue.maxPrice && formValue.maxPrice > 0) {
      params.maxPrice = formValue.maxPrice;
    }

    if (formValue.isSublet) {
      params.isSublet = formValue.isSublet;
    }

    // Only add amenities if there are any selected
    const amenities = formValue.amenities as string[];
    if (amenities && amenities.length > 0) {
      params.amenities = amenities;
    }

    // Only add date range if both dates are provided
    if (formValue.subletStartDate) {
      params.subletStartDate = formValue.subletStartDate;
    }

    if (formValue.subletEndDate) {
      params.subletEndDate = formValue.subletEndDate;
    }

    if (formValue.sortBy) {
      params.sortBy = formValue.sortBy;
    }

    this.isLoading = true; // Set loading to true before API call
    this.propertyService.searchProperties(params).subscribe({
      next: (response) => {
        this.properties = response.properties;
        console.log('Search results:', this.properties);
        this.totalItems = response.pagination.total;
        this.isLoading = false; // Set loading to false after response
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false; // Also set loading to false on error
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.itemsPerPage = event.pageSize;
    this.search();
  }

  resetFilters() {
    this.searchForm.reset({
      city: '',
      minPrice: 0,
      maxPrice: 5000,
      isSublet: false,
      amenities: [],
      subletStartDate: '',
      subletEndDate: '',
      sortBy: 'date_desc',
    });

    // Manually trigger search since we're bypassing the valueChanges observable
    this.currentPage = 1;
    this.search();
  }
}
