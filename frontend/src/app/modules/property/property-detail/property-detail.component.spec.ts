import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDetailComponent } from './property-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('PropertyDetailComponent', () => {
  let component: PropertyDetailComponent;
  let fixture: ComponentFixture<PropertyDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetailComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
