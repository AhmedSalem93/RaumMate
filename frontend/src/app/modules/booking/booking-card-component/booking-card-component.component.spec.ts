import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCardComponentComponent } from './booking-card-component.component';

describe('BookingCardComponentComponent', () => {
  let component: BookingCardComponentComponent;
  let fixture: ComponentFixture<BookingCardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCardComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
