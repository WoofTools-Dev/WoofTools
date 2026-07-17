import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BigSwapExplorerComponent } from './big-swap-explorer.component';

describe('BigSwapExplorerComponent', () => {
  let component: BigSwapExplorerComponent;
  let fixture: ComponentFixture<BigSwapExplorerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BigSwapExplorerComponent],
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NoopAnimationsModule,
      ]
    });
    fixture = TestBed.createComponent(BigSwapExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
