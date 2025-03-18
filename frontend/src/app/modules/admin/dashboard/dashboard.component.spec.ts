import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AdminService } from '../admin.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  // Mock data
  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  ];

  const mockProperties = [
    { _id: '1', name: 'Apartment 1', owner: 'John Doe', status: 'pending' },
    { _id: '2', name: 'House 2', owner: 'Jane Smith', status: 'verified' },
  ];

  const mockReviews = [
    {
      _id: '1',
      property: 'Apartment 1',
      reviewer: 'John Doe',
      rating: 4,
      status: 'pending',
    },
    {
      _id: '2',
      property: 'House 2',
      reviewer: 'Jane Smith',
      rating: 5,
      status: 'approved',
    },
  ];

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'getUsers',
      'updateUser',
      'deleteUser',
      'getProperties',
      'verifyProperty',
      'rejectProperty',
      'getReviews',
      'approveReview',
      'rejectReview',
    ]);

    // Setup default return values for service methods
    mockAdminService.getUsers.and.returnValue(of(mockUsers));
    mockAdminService.getProperties.and.returnValue(of(mockProperties));
    mockAdminService.getReviews.and.returnValue(of(mockReviews));
    mockAdminService.updateUser.and.returnValue(of({}));
    mockAdminService.deleteUser.and.returnValue(of({}));
    mockAdminService.verifyProperty.and.returnValue(of({}));
    mockAdminService.rejectProperty.and.returnValue(of({}));
    mockAdminService.approveReview.and.returnValue(of({}));
    mockAdminService.rejectReview.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, CommonModule],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load users, properties, and reviews on init', () => {
      expect(mockAdminService.getUsers).toHaveBeenCalled();
      expect(mockAdminService.getProperties).toHaveBeenCalled();
      expect(mockAdminService.getReviews).toHaveBeenCalled();

      expect(component.users).toEqual(mockUsers);
      expect(component.properties).toEqual(mockProperties);
      expect(component.reviews).toEqual(mockReviews);
    });
  });

  describe('User Management', () => {
    it('should call updateUser service when updateUser is called', () => {
      const user = mockUsers[0];
      component.updateUser(user);

      expect(mockAdminService.updateUser).toHaveBeenCalledWith(user._id, user);
      expect(mockAdminService.getUsers).toHaveBeenCalledTimes(2); // Once on init, once after update
    });

    it('should call deleteUser service when deleteUser is called', () => {
      const user = mockUsers[0];
      component.deleteUser(user);

      expect(mockAdminService.deleteUser).toHaveBeenCalledWith(user._id);
      expect(mockAdminService.getUsers).toHaveBeenCalledTimes(2); // Once on init, once after delete
    });
  });

  describe('Property Management', () => {
    it('should call verifyProperty service when verifyProperty is called', () => {
      const property = mockProperties[0];
      component.verifyProperty(property);

      expect(mockAdminService.verifyProperty).toHaveBeenCalledWith(
        property._id
      );
      expect(mockAdminService.getProperties).toHaveBeenCalledTimes(2); // Once on init, once after verify
    });

    it('should call rejectProperty service when rejectProperty is called', () => {
      const property = mockProperties[0];
      component.rejectProperty(property);

      expect(mockAdminService.rejectProperty).toHaveBeenCalledWith(
        property._id
      );
      expect(mockAdminService.getProperties).toHaveBeenCalledTimes(2); // Once on init, once after reject
    });
  });

  describe('Review Management', () => {
    it('should call approveReview service when approveReview is called', () => {
      const review = mockReviews[0];
      component.approveReview(review);

      expect(mockAdminService.approveReview).toHaveBeenCalledWith(review._id);
      expect(mockAdminService.getReviews).toHaveBeenCalledTimes(2); // Once on init, once after approve
    });

    it('should call rejectReview service when rejectReview is called', () => {
      const review = mockReviews[0];
      component.rejectReview(review);

      expect(mockAdminService.rejectReview).toHaveBeenCalledWith(review._id);
      expect(mockAdminService.getReviews).toHaveBeenCalledTimes(2); // Once on init, once after reject
    });
  });
});
