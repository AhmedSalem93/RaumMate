import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PropertyService } from '../../../core/services/property.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Property } from '../../../shared/models/property.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let propertyServiceSpy: jasmine.SpyObj<PropertyService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PropertyService', [
      'getAmenities',
      'searchProperties',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SearchComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatPaginatorModule,
        MatNativeDateModule,
      ],
      providers: [{ provide: PropertyService, useValue: spy }],
      schemas: [NO_ERRORS_SCHEMA], // Ignore child components like mat-form-field
    }).compileComponents();

    propertyServiceSpy = TestBed.inject(
      PropertyService
    ) as jasmine.SpyObj<PropertyService>;

    // Mock successful responses
    propertyServiceSpy.getAmenities.and.returnValue(
      of(['Balcony', 'Pool', 'Gym'])
    );
    propertyServiceSpy.searchProperties.and.returnValue(
      of({
        pagination: { total: 2, page: 1, limit: 10 },
        properties: [
          {
            _id: '1',
            title: 'Test Property 1',
            description: 'Description 1',
            price: 1000,
            location: { city: 'Berlin' },
            amenities: ['Balcony'],
            mediaPaths: [],
            isSublet: false,
            isAvailable: true,
            reviews: { averageRating: 4, count: 2 },
            owner: 'user1',
          },
          {
            _id: '2',
            title: 'Test Property 2',
            description: 'Description 2',
            price: 1500,
            location: { city: 'Munich' },
            amenities: ['Pool'],
            mediaPaths: [],
            isSublet: true,
            isAvailable: true,
            reviews: { averageRating: 4.5, count: 5 },
            owner: 'user2',
          },
        ] as Property[],
      })
    );

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load amenities on initialization', () => {
    expect(propertyServiceSpy.getAmenities).toHaveBeenCalled();
    expect(component.amenitiesList.length).toBeGreaterThan(0);
    expect(component.amenitiesList).toContain('Balcony');
  });

  it('should handle amenities loading error with fallback values', () => {
    // Recreate component with error response
    propertyServiceSpy.getAmenities.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.amenitiesList).toEqual([
      'Balcony',
      'Pool',
      'Gym',
      'Parking',
      'Pet Friendly',
    ]);
  });

  it('should perform search on initialization', () => {
    expect(propertyServiceSpy.searchProperties).toHaveBeenCalled();
    expect(component.properties.length).toBe(2);
    expect(component.totalItems).toBe(2);
  });

  it('should update search parameters correctly when form values change', () => {
    // Set form values
    component.searchForm.patchValue({
      city: 'Berlin',
      minPrice: 500,
      maxPrice: 2000,
      isSublet: true,
      amenities: ['Balcony', 'Pool'],
      sortBy: 'price_asc',
    });

    // Trigger search manually (since we're bypassing debounce in test)
    component.search();

    // Get last call to searchProperties
    const lastCall =
      propertyServiceSpy.searchProperties.calls.mostRecent().args[0];

    // Verify correct parameters were passed
    expect(lastCall.city).toBe('Berlin');
    expect(lastCall.minPrice).toBe(500);
    expect(lastCall.maxPrice).toBe(2000);
    expect(lastCall.isSublet).toBe(true);
    expect(lastCall.amenities).toContain('Balcony');
    expect(lastCall.amenities).toContain('Pool');
    expect(lastCall.sortBy).toBe('price_asc');
  });

  it('should handle pagination correctly', () => {
    // Simulate page change event
    const pageEvent: PageEvent = {
      pageIndex: 2, // This is 0-based, so page 3
      pageSize: 20,
      length: 100,
    };

    component.onPageChange(pageEvent);

    expect(component.currentPage).toBe(3); // Component converts to 1-based
    expect(component.itemsPerPage).toBe(20);
    expect(propertyServiceSpy.searchProperties).toHaveBeenCalled();

    const lastCall =
      propertyServiceSpy.searchProperties.calls.mostRecent().args[0];
    expect(lastCall.page).toBe(3);
    expect(lastCall.limit).toBe(20);
  });

  it('should reset filters correctly', () => {
    // First set some values
    component.searchForm.patchValue({
      city: 'Berlin',
      minPrice: 500,
      maxPrice: 2000,
      isSublet: true,
      amenities: ['Balcony', 'Pool'],
      sortBy: 'price_asc',
    });

    // Reset filters
    component.resetFilters();

    // Check form was reset to defaults
    expect(component.searchForm.get('city')?.value).toBe('');
    expect(component.searchForm.get('minPrice')?.value).toBe(0);
    expect(component.searchForm.get('maxPrice')?.value).toBe(5000);
    expect(component.searchForm.get('isSublet')?.value).toBe(false);
    expect(component.searchForm.get('amenities')?.value).toEqual([]);
    expect(component.searchForm.get('sortBy')?.value).toBe('date_desc');

    // Check that page was reset to first page
    expect(component.currentPage).toBe(1);

    // Check search was called with reset values
    expect(propertyServiceSpy.searchProperties).toHaveBeenCalled();
  });
});
