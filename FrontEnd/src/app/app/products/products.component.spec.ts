import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';

import { ProductsComponent } from './products.component';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsComponent],
      imports: [MatIconModule],
    });
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list product cards', () => {
    expect(component.products.length).toBeGreaterThan(0);
  });

  it('should include core products', () => {
    const titles = component.products.map(p => p.title);
    expect(titles).toContain('WOOFboard');
    expect(titles).toContain('Pair Explorer');
    expect(titles).toContain('MultiChart');
    expect(titles).toContain('Stats');
    expect(titles).toContain('Wallet Info');
  });

  it('should have route or url for each product', () => {
    for (const p of component.products) {
      expect(p.route || p.url).toBeTruthy();
    }
  });
});
