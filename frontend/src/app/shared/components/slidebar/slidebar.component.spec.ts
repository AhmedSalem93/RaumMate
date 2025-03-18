import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SlidebarComponent } from './slidebar.component';
import { DebugElement } from '@angular/core';

describe('SlidebarComponent', () => {
  let component: SlidebarComponent;
  let fixture: ComponentFixture<SlidebarComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlidebarComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SlidebarComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    // Set up mock data for testing
    component.user = {
      firstName: 'John',
      lastName: 'Doe',
      role: 'tenant',
      profilePicture: 'https://example.com/profile.jpg',
    };
    component.reviews = [];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name correctly', () => {
    const nameElement = debugElement.query(
      By.css('.profile-pic h3')
    ).nativeElement;
    expect(nameElement.textContent.trim()).toBe('John Doe');
  });

  it('should display user role in uppercase', () => {
    const roleElement = debugElement.query(By.css('.role')).nativeElement;
    expect(roleElement.textContent.trim()).toBe('TENANT');
  });

  it('should display the provided profile picture when available', () => {
    const imgElement = debugElement.query(
      By.css('.profile-pic img')
    ).nativeElement;
    expect(imgElement.src).toContain('https://example.com/profile.jpg');
  });

  it('should display default profile picture when user profile picture is not available', () => {
    component.user = {
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'landlord',
      profilePicture: null,
    };
    fixture.detectChanges();

    const imgElement = debugElement.query(
      By.css('.profile-pic img')
    ).nativeElement;
    expect(imgElement.src).toBe(component.defaultProfilePicture);
  });

  it('should show "No reviews yet" when reviews array is empty', () => {
    component.reviews = [];
    fixture.detectChanges();

    const noReviewsElement = debugElement.query(
      By.css('.profile-pic div')
    ).nativeElement;
    expect(noReviewsElement.textContent.trim()).toBe('No reviews yet');
  });

  it('should not show "No reviews yet" when reviews array has items', () => {
    component.reviews = [{ id: 1, text: 'Great tenant!' }];
    fixture.detectChanges();

    const noReviewsElement = debugElement.query(By.css('.profile-pic div'));
    expect(noReviewsElement).toBeNull();
  });

  it('should render all navigation links', () => {
    const links = debugElement.queryAll(By.css('nav a'));
    expect(links.length).toBe(6);

    const routerLinks = [
      '/user/profile',
      '/user/setting',
      '/user/my-listing',
      '/messages',
      '/property/create',
      '/user/booking',
    ];

    links.forEach((link, index) => {
      expect(link.attributes['routerLink']).toBe(routerLinks[index]);
    });
  });
});
