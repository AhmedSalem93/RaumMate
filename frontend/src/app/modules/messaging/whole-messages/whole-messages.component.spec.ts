import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeMessagesComponent } from './whole-messages.component';

describe('WholeMessagesComponent', () => {
  let component: WholeMessagesComponent;
  let fixture: ComponentFixture<WholeMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholeMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WholeMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
