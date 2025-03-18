import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FooterComponent } from './footer.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display copyright text', () => {
    const footerElement = fixture.debugElement.query(By.css('.footer p'));
    expect(footerElement).toBeTruthy();
    expect(footerElement.nativeElement.textContent).toContain('© 2025 RaumMate. All rights reserved.');
  });

  it('should contain footer links', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer-links a'));
    expect(links.length).toBe(3); // About Us, Search Room, Contact

    // Check for specific links
    const linkTexts = links.map(link => link.nativeElement.textContent.trim());
    expect(linkTexts).toContain('About Us');
    expect(linkTexts).toContain('Search Room');
    expect(linkTexts).toContain('Contact');
  });

  it('should have correct router links', () => {
    const links = fixture.debugElement.queryAll(By.css('.footer-links a'));

    expect(links[0].attributes['routerLink']).toBe('/about');
    expect(links[1].attributes['routerLink']).toBe('/search');
    expect(links[2].attributes['routerLink']).toBe('/contact');
  });
});
