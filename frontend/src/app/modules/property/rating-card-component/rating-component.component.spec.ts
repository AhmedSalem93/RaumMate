import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingCardComponentComponent } from './rating-component.component';

describe('RatingComponentComponent', () => {
  let component: RatingCardComponentComponent;
  let fixture: ComponentFixture<RatingCardComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingCardComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingCardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
