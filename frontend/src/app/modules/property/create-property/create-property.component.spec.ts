import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePropertyComponent } from './create-property.component';
import { provideHttpClient } from '@angular/common/http';

describe('CreatePropertyComponent', () => {
  let component: CreatePropertyComponent;
  let fixture: ComponentFixture<CreatePropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePropertyComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
