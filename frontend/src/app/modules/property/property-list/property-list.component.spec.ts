import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyListComponent } from './property-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Property } from '../../../shared/models/property.model';
import { provideRouter } from '@angular/router';

describe('PropertyListComponent', () => {
  let component: PropertyListComponent;
  let fixture: ComponentFixture<PropertyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListComponent);
    component = fixture.componentInstance;

    // Add mock properties
    component.properties = [
      {
        _id: 'prop1',
        title: 'Test Property',
        description: 'Test description',
        price: 1000,
        location: { city: 'Berlin' },
        amenities: ['WiFi'],
        mediaPaths: [],
        reviews: { averageRating: 4, count: 2 },
        isAvailable: true,
        isSublet: false,
        owner: 'user1',
      },
    ] as Property[];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log initialization message on creation', () => {
    spyOn(console, 'log');
    const newInstance = new PropertyListComponent();
    expect(console.log).toHaveBeenCalledWith(
      'Property List Component Initialized'
    );
  });
});
