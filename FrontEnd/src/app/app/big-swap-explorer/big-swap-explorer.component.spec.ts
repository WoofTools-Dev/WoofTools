import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigSwapExplorerComponent } from './big-swap-explorer.component';

describe('BigSwapExplorerComponent', () => {
  let component: BigSwapExplorerComponent;
  let fixture: ComponentFixture<BigSwapExplorerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BigSwapExplorerComponent]
    });
    fixture = TestBed.createComponent(BigSwapExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
