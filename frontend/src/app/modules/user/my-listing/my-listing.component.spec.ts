import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyListingComponent } from './my-listing.component';
import { UserService } from '../../../core/services/user.service';
import { ReviewService } from '../../../services/review.service';
import { PropertyService } from '../../../core/services/property.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Mock components
@Component({
  selector: 'app-mock-slidebar', // Changed selector to avoid conflict
  template: '<div>Mock Sidebar</div>',
})
class MockSlidebarComponent {
  @Input() user: any;
  @Input() reviews: any[] = []; // Initialize with an empty array to fix TypeScript error
}

@Component({
  selector: 'app-property-card',
  template: '<div>Mock Property Card</div>',
})
class MockPropertyCardComponent {
  @Input() property: any;
}

describe('MyListingComponent', () => {
  let component: MyListingComponent;
  let fixture: ComponentFixture<MyListingComponent>;
  let userServiceMock: any;
  let reviewServiceMock: any;
  let propertyServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    // Mock services
    userServiceMock = {
      getProfile: jasmine.createSpy('getProfile').and.returnValue(
        of({
          _id: '123',
          profileCompleted: true,
          firstName: 'Test',
          lastName: 'User',
        })
      ),
    };

    reviewServiceMock = {
      getUserReviews: jasmine
        .createSpy('getUserReviews')
        .and.returnValue(of([{ id: '1', rating: 4, comment: 'Great place!' }])),
    };

    propertyServiceMock = {
      getMyProperties: jasmine
        .createSpy('getMyProperties')
        .and.returnValue(
          of([{ _id: '1', title: 'Test Property', price: 1000 }])
        ),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      declarations: [MockSlidebarComponent, MockPropertyCardComponent],
      imports: [CommonModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ReviewService, useValue: reviewServiceMock },
        { provide: PropertyService, useValue: propertyServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    // Override MyListingComponent to use mock components
    TestBed.overrideComponent(MyListingComponent, {
      set: {
        imports: [CommonModule],
        template: `
          <div class="listings-dashboard">
            <app-mock-slidebar [user]="user" [reviews]="reviews"></app-mock-slidebar>
            <section class="listings-content">
              <!-- Rest of the template -->
            </section>
          </div>
        `,
      },
    });

    fixture = TestBed.createComponent(MyListingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should fetch user profile on init', () => {
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
    fixture.detectChanges();
    expect(userServiceMock.getProfile).toHaveBeenCalled();
    expect(component.user).toEqual({
      _id: '123',
      profileCompleted: true,
      firstName: 'Test',
      lastName: 'User',
    });
  });

  it('should redirect to login if no token is found', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to complete profile if profile is not completed', () => {
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
    userServiceMock.getProfile.and.returnValue(
      of({
        _id: '123',
        profileCompleted: false,
      })
    );
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['user/complete-profile']);
  });

  it('should fetch properties and reviews for the user', () => {
    spyOn(localStorage, 'getItem').and.returnValue('mock-token');
    fixture.detectChanges();
    expect(propertyServiceMock.getMyProperties).toHaveBeenCalledWith('123');
    expect(reviewServiceMock.getUserReviews).toHaveBeenCalled();
    expect(component.properties.length).toBe(1);
    expect(component.reviews.length).toBe(1);
  });
});
