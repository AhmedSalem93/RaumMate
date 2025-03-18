import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingCardComponentComponent } from './rating-component.component';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgFor } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Rating } from '../../../shared/models/rating.model';
import { User } from '../../../shared/models/user.model';

describe('RatingCardComponentComponent', () => {
  let component: RatingCardComponentComponent;
  let fixture: ComponentFixture<RatingCardComponentComponent>;

  const mockRating: Rating = {
    property: 'prop123',
    user: {
      _id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'registered',
      isVerified: true,
      profilePicture: 'https://example.com/avatar.jpg',
    },
    rating: 4,
    comment: 'Great property with excellent amenities!',
    createdAt: new Date('2023-06-15'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingCardComponentComponent, MatIconModule, NgFor, DatePipe],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCardComponentComponent);
    component = fixture.componentInstance;
    // Set the input property
    component.userRating = mockRating;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user first name correctly', () => {
    expect(component.getUserFirstName(mockRating.user)).toBe('John');

    // Test with missing user
    expect(component.getUserFirstName(null)).toBe('Anonymous');
    expect(component.getUserFirstName(undefined)).toBe('Anonymous');

    // Test with missing firstName
    const userWithoutName = {
      ...(mockRating.user as User),
      firstName: undefined,
    };
    expect(component.getUserFirstName(userWithoutName)).toBe('Anonymous');
  });

  it('should display user last name correctly', () => {
    expect(component.getUserLastName(mockRating.user)).toBe('Doe');

    // Test with missing user or lastName
    expect(component.getUserLastName(null)).toBe('');
    const userWithoutLastName = {
      ...(mockRating.user as User),
      lastName: undefined,
    };
    expect(component.getUserLastName(userWithoutLastName)).toBe('');
  });

  it('should generate user initials correctly', () => {
    expect(component.getUserInitials(mockRating.user)).toBe('JD');

    // Test with missing user
    expect(component.getUserInitials(null)).toBe('U');

    // Test with missing names
    const userWithoutFirstName = {
      ...(mockRating.user as User),
      firstName: undefined,
    };
    const userWithoutLastName = {
      ...(mockRating.user as User),
      lastName: undefined,
    };
    const userWithoutBothNames = {
      ...(mockRating.user as User),
      firstName: undefined,
      lastName: undefined,
    };

    expect(component.getUserInitials(userWithoutFirstName)).toBe('D');
    expect(component.getUserInitials(userWithoutLastName)).toBe('J');
    expect(component.getUserInitials(userWithoutBothNames)).toBe('U');
  });

  it('should return user avatar URL correctly', () => {
    expect(component.getUserAvatar(mockRating.user)).toBe(
      'https://example.com/avatar.jpg'
    );

    // Test with missing user or profilePicture
    expect(component.getUserAvatar(null)).toBe('');
    const userWithoutAvatar = {
      ...(mockRating.user as User),
      profilePicture: undefined,
    };
    expect(component.getUserAvatar(userWithoutAvatar)).toBe('');
  });

  it('should validate user object correctly', () => {
    expect(component.isValidUser(mockRating.user)).toBeTrue();

    // Test invalid cases
    expect(component.isValidUser(null)).not.toBeTruthy();
    expect(component.isValidUser('string')).toBeFalse();
    expect(component.isValidUser(123)).toBeFalse();
  });

  it('should validate date correctly', () => {
    expect(component.isValidDate(new Date())).toBeTrue();
    expect(component.isValidDate(new Date('2023-06-15'))).toBeTrue();

    // Test invalid dates
    expect(component.isValidDate(null)).toBeFalse();
    expect(component.isValidDate(undefined)).toBeFalse();
    expect(component.isValidDate('not-a-date')).toBeFalse();
    expect(component.isValidDate(new Date('invalid-date'))).toBeFalse();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2023-06-15');
    expect(component.getFormattedDate(testDate)).toEqual(testDate);

    // Test invalid date
    expect(component.getFormattedDate('not-a-date')).toBeNull();
    expect(component.getFormattedDate(null)).toBeNull();
  });

  // DOM tests
  it('should render user information correctly', () => {
    const nameElement = fixture.debugElement.query(By.css('.card-title'));
    expect(nameElement).toBeTruthy();
    expect(nameElement.nativeElement.textContent).toContain('John Doe');
  });

  it('should render correct number of star icons for rating', () => {
    const stars = fixture.debugElement.queryAll(By.css('mat-icon'));

    // Filter only the rating stars (might have other icons)
    const ratingStars = stars.filter((star) => {
      const text = star.nativeElement.textContent.trim();
      return text === 'star' || text === 'star_border';
    });

    // Should have 5 stars total
    expect(ratingStars.length).toBe(5);

    // Should have 4 filled stars (based on 4-star rating)
    const filledStars = ratingStars.filter(
      (star) => star.nativeElement.textContent.trim() === 'star'
    );
    expect(filledStars.length).toBe(4);

    // Should have 1 empty star
    const emptyStars = ratingStars.filter(
      (star) => star.nativeElement.textContent.trim() === 'star_border'
    );
    expect(emptyStars.length).toBe(1);
  });

  it('should display rating comment when available', () => {
    const commentElement = fixture.debugElement.query(By.css('.comment-text'));
    expect(commentElement).toBeTruthy();
    expect(commentElement.nativeElement.textContent).toContain(
      'Great property with excellent amenities!'
    );

    // Test with no comment
    component.userRating = { ...mockRating, comment: undefined };
    fixture.detectChanges();

    const noCommentElement = fixture.debugElement.query(By.css('.comment'));
    expect(noCommentElement).toBeFalsy(); // Should not render comment section
  });
});
