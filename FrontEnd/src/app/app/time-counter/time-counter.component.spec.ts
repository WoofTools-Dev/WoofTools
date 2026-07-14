import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeCounterComponent } from './time-counter.component';

describe('TimeCounterComponent', () => {
  let component: TimeCounterComponent;
  let fixture: ComponentFixture<TimeCounterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeCounterComponent]
    });
    fixture = TestBed.createComponent(TimeCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
