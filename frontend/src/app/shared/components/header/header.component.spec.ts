import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have logo with text RaumMate', () => {
    const logo = fixture.debugElement.query(By.css('.logo'));
    expect(logo).toBeTruthy();
    expect(logo.nativeElement.textContent).toBe('RaumMate');
  });

  it('should contain navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('.nav-links .link'));
    expect(links.length).toBeGreaterThanOrEqual(4); // Home, Search, About, Contact

    // Check for specific links
    const navTexts = links.map((link) => link.nativeElement.textContent.trim());
    expect(navTexts).toContain('Home');
    expect(navTexts).toContain('Search Room');
    expect(navTexts).toContain('About Us');
    expect(navTexts).toContain('Contact');
  });

  it('should call logout method and navigate to login when logout is clicked', () => {
    spyOn(router, 'navigate');
    spyOn(window.location, 'reload');

    component.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should return true from isLoggedIn when token exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('fake-token');
    expect(component.isLoggedIn()).toBeTrue();
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });

  it('should return false from isLoggedIn when token does not exist', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(component.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem).toHaveBeenCalledWith('token');
  });
});
