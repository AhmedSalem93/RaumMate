import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyListComponent } from './property-list.component';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { Property } from '../../../shared/models/property.model';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

// Mock PropertyCardComponent
@Component({
  selector: 'app-property-card',
  template: '<div class="mock-property-card">{{property.title}}</div>',
  standalone: true,
})
class MockPropertyCardComponent {
  @Input() property!: Property;
}

describe('PropertyListComponent', () => {
  let component: PropertyListComponent;
  let fixture: ComponentFixture<PropertyListComponent>;
  let mockProperties: Property[];

  beforeEach(async () => {
    // Create mock properties
    mockProperties = [
      {
        _id: 'prop1',
        title: 'Test Property 1',
        description: 'Test description 1',
        price: 1000,
        location: { city: 'Berlin' },
        amenities: ['WiFi'],
        mediaPaths: [],
        reviews: { averageRating: 4, count: 2 },
        isAvailable: true,
        isSublet: false,
        owner: 'user1',
      },
      {
        _id: 'prop2',
        title: 'Test Property 2',
        description: 'Test description 2',
        price: 1500,
        location: { city: 'Munich' },
        amenities: ['Pool', 'Gym'],
        mediaPaths: [],
        reviews: { averageRating: 3.5, count: 4 },
        isAvailable: true,
        isSublet: true,
        owner: 'user2',
        subletDates: {
          start: '2023-01-01',
          end: '2023-03-01',
        },
      },
    ] as Property[];

    await TestBed.configureTestingModule({
      imports: [
        PropertyListComponent,
        MockPropertyCardComponent,
        HttpClientTestingModule,
      ],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.properties = mockProperties;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should pass the correct property to each property-card component', () => {
    component.properties = mockProperties;
    fixture.detectChanges();

    const propertyCardDebugElements = fixture.debugElement.queryAll(
      By.directive(MockPropertyCardComponent)
    );
    const firstCardInstance = propertyCardDebugElements[0]
      .componentInstance as MockPropertyCardComponent;
    const secondCardInstance = propertyCardDebugElements[1]
      .componentInstance as MockPropertyCardComponent;

    expect(firstCardInstance.property.title).toBe('Test Property 1');
    expect(secondCardInstance.property.title).toBe('Test Property 2');
  });

  it('should display the "No properties available" message when properties array is empty', () => {
    component.properties = [];
    fixture.detectChanges();

    const noPropertiesMessage = fixture.debugElement.query(By.css('p'));
    expect(noPropertiesMessage.nativeElement.textContent).toContain(
      'No properties available'
    );
  });

  it('should not display property cards when properties array is empty', () => {
    component.properties = [];
    fixture.detectChanges();

    const propertyElements = fixture.debugElement.queryAll(
      By.css('app-property-card')
    );
    expect(propertyElements.length).toBe(0);
  });

  it('should handle null or undefined properties gracefully', () => {
    component.properties = undefined as any;
    fixture.detectChanges();

    const noPropertiesMessage = fixture.debugElement.query(By.css('p'));
    expect(noPropertiesMessage.nativeElement.textContent).toContain(
      'No properties available'
    );
  });
});
