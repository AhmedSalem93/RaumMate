import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component data', () => {
    it('should have cities data defined', () => {
      expect(component.cities).toBeDefined();
      expect(component.cities.length).toBe(4);
    });

    it('should contain Berlin with 120 listings', () => {
      const berlin = component.cities.find((city) => city.name === 'Berlin');
      expect(berlin).toBeDefined();
      expect(berlin?.listings).toBe(120);
    });

    it('should have listings data defined', () => {
      expect(component.listings).toBeDefined();
      expect(component.listings.length).toBe(4);
    });

    it('should have correct listing properties', () => {
      const firstListing = component.listings[0];
      expect(firstListing.id).toBeDefined();
      expect(firstListing.title).toBeDefined();
      expect(firstListing.location).toBeDefined();
      expect(firstListing.price).toBeDefined();
      expect(firstListing.image).toBeDefined();
    });
  });

  describe('DOM elements', () => {
    it('should have a hero section with heading and CTA button', () => {
      const heroSection = fixture.debugElement.query(By.css('.hero'));
      expect(heroSection).toBeTruthy();

      const heading = heroSection.query(By.css('h1'));
      expect(heading.nativeElement.textContent).toContain(
        'Find Your Perfect Roommate'
      );

      const ctaButton = heroSection.query(By.css('.cta-btn'));
      expect(ctaButton).toBeTruthy();
      expect(ctaButton.nativeElement.textContent).toContain('Start Searching');
    });

    it('should display all cities', () => {
      const cityElements = fixture.debugElement.queryAll(By.css('.city-box'));
      expect(cityElements.length).toBe(4);

      component.cities.forEach((city, index) => {
        expect(
          cityElements[index].query(By.css('h3')).nativeElement.textContent
        ).toContain(city.name);
        expect(
          cityElements[index].query(By.css('p')).nativeElement.textContent
        ).toContain(`${city.listings} Listings`);
      });
    });

    it('should display all listings', () => {
      const listingElements = fixture.debugElement.queryAll(
        By.css('.listing-box')
      );
      expect(listingElements.length).toBe(4);

      listingElements.forEach((element, index) => {
        const listing = component.listings[index];
        expect(element.query(By.css('h3')).nativeElement.textContent).toContain(
          listing.title
        );
        expect(element.query(By.css('p')).nativeElement.textContent).toContain(
          listing.location
        );
        expect(element.query(By.css('p')).nativeElement.textContent).toContain(
          `€${listing.price}/month`
        );
        expect(element.query(By.css('img')).properties['src']).toBe(
          listing.image
        );
        expect(
          element.query(By.css('.view-details')).nativeElement.textContent
        ).toContain('View Details');
      });
    });

    it('should have a property owner section with a CTA button', () => {
      const ownerSection = fixture.debugElement.query(By.css('.owner-section'));
      expect(ownerSection).toBeTruthy();

      const heading = ownerSection.query(By.css('h2'));
      expect(heading.nativeElement.textContent).toContain(
        'Looking for a roommate?'
      );

      const listBtn = ownerSection.query(By.css('.list-btn'));
      expect(listBtn).toBeTruthy();
      expect(listBtn.nativeElement.textContent).toContain('List Your Property');
    });
  });
});
