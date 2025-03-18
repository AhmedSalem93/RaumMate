import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyCardComponent } from './property-card.component';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Property } from '../../models/property.model';
import { RouterTestingModule } from '@angular/router/testing';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { User } from '../../models/user.model';

describe('PropertyCardComponent', () => {
  let component: PropertyCardComponent;
  let fixture: ComponentFixture<PropertyCardComponent>;
  let debugElement: DebugElement;

  const mockProperty: Property = {
    _id: '123',
    title: '2-Zimmer Wohnung',
    description: 'Nice apartment',
    price: 1200,
    location: {
      city: 'Berlin',
      address: 'Test Street 123',
      coordinates: { lat: 52.52, lng: 13.405 },
    },
    mediaPaths: ['/images/property1.jpg'],
    amenities: ['Wifi', 'Kitchen', 'Parking'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    owner: {
      _id: 'owner1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      profilePicture: 'profile.jpg',
    } as User,
    subletDates: {
      start: new Date('2023-05-01').toISOString(),
      end: new Date('2023-08-31').toISOString(),
    },
    reviews: {
      count: 5,
      averageRating: 4.5,
    },
    isAvailable: false,
    isSublet: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PropertyCardComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [CurrencyPipe, DatePipe],
      schemas: [NO_ERRORS_SCHEMA], // To ignore material component errors
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCardComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Set the mock property before detection
    component.property = mockProperty;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display property title correctly', () => {
    const titleElement = debugElement.query(By.css('.title'));
    expect(titleElement.nativeElement.textContent).toContain(
      'Beautiful Apartment'
    );
  });

  it('should extract room count correctly from title', () => {
    expect(component.getRoomCount()).toBe(2);

    // Test with a different title
    component.property.title = '3-Zimmer Apartment';
    expect(component.getRoomCount()).toBe(3);

    // Test with no room count in title
    component.property.title = 'Beautiful Apartment';
    expect(component.getRoomCount()).toBe(1); // Should return default value
  });

  it('should display city location', () => {
    const locationElement = debugElement.query(By.css('.subtitle'));
    expect(locationElement.nativeElement.textContent).toContain('Berlin');
  });

  it('should format created date correctly', () => {
    expect(component.getFormattedCreatedAt()).toBe('4 days ago');

    // Test with yesterday
    component.property.createdAt = new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(component.getFormattedCreatedAt()).toBe('yesterday');

    // Test with older date
    component.property.createdAt = new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(component.getFormattedCreatedAt()).not.toBe('yesterday');
    expect(component.getFormattedCreatedAt()).not.toContain('days ago');
  });

  it('should generate correct star array for reviews', () => {
    const stars = component.getStarArray();
    expect(stars.length).toBe(5);
    expect(stars[0].full).toBeTrue();
    expect(stars[4].full).toBeFalse();

    // Test with no reviews
    component.property.reviews = { count: 0, averageRating: 0 };
    expect(component.hasReviews()).toBeFalse();
    expect(component.getStarArray().length).toBe(0);
  });

  it('should handle missing owner data gracefully', () => {
    component.property.owner = 'owner123'; // Set to string ID instead of object
    expect(component.getOwnerName()).toBe('');
    expect(component.ownerAvatarUrl).toBe(component.ownerAvatarFallback);
  });

  it('should handle missing media paths', () => {
    component.property.mediaPaths = [];
    expect(component.firstImageUrl).toContain('placehold.co');
  });

  it('should display owner information correctly', () => {
    const ownerNameElement = debugElement.query(By.css('.owner-name'));
    expect(ownerNameElement.nativeElement.textContent).toBe('');
  });

  it('should display sublet dates when available', () => {
    const rentalPeriodElement = debugElement.query(By.css('.rental-period'));
    expect(rentalPeriodElement).toBeTruthy();
    expect(rentalPeriodElement.nativeElement.textContent).toContain(
      '01.05.2023'
    );
    expect(rentalPeriodElement.nativeElement.textContent).toContain(
      '31.08.2023'
    );
  });
});
