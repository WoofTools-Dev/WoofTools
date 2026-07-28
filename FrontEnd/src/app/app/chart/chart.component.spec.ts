import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

import { TokenChartComponent } from './chart.component';

Chart.register(...registerables);

describe('TokenChartComponent', () => {
  let component: TokenChartComponent;
  let fixture: ComponentFixture<TokenChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TokenChartComponent],
      imports: [NgChartsModule, NoopAnimationsModule],
    });
    fixture = TestBed.createComponent(TokenChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not generate chart data when data is empty', () => {
    component.data = [];
    component.ngOnChanges({});
    expect(component.chartData).toBeUndefined();
  });

  it('should generate chart data when data is provided', () => {
    component.data = [1, 2, 3, 4, 5];
    component.ngOnChanges({});
    expect(component.chartData).toBeDefined();
    expect(component.chartData!.datasets[0].data).toEqual([1, 2, 3, 4, 5]);
  });

  it('should set green color when price goes up', () => {
    component.data = [1, 2, 3];
    component.ngOnChanges({});
    const borderColor = component.chartData!.datasets[0].borderColor;
    expect(borderColor).toBe('#22c55e');
  });

  it('should set red color when price goes down', () => {
    component.data = [3, 2, 1];
    component.ngOnChanges({});
    const borderColor = component.chartData!.datasets[0].borderColor;
    expect(borderColor).toBe('#ef4444');
  });

  it('should generate Start/Now labels', () => {
    component.data = [1, 2, 3, 4, 5];
    component.ngOnChanges({});
    const labels = component.chartData!.labels as string[];
    expect(labels[0]).toBe('Start');
    expect(labels[labels.length - 1]).toBe('Now');
    expect(labels[1]).toBe('');
    expect(labels[2]).toBe('');
    expect(labels[3]).toBe('');
  });

  it('should show axes when showAxes is true', () => {
    component.data = [1, 2, 3];
    component.showAxes = true;
    component.ngOnChanges({});
    expect(component.chartOptions!.scales!['x']!.display).toBe(true);
    expect(component.chartOptions!.scales!['y']!.display).toBe(true);
  });

  it('should hide axes when showAxes is false', () => {
    component.data = [1, 2, 3];
    component.showAxes = false;
    component.ngOnChanges({});
    expect(component.chartOptions!.scales!['x']!.display).toBe(false);
    expect(component.chartOptions!.scales!['y']!.display).toBe(false);
  });

  it('should enable tooltips when showAxes is true', () => {
    component.data = [1, 2, 3];
    component.showAxes = true;
    component.ngOnChanges({});
    expect(component.chartOptions!.plugins!.tooltip!.enabled).toBe(true);
  });

  it('should disable tooltips when showAxes is false', () => {
    component.data = [1, 2, 3];
    component.showAxes = false;
    component.ngOnChanges({});
    expect(component.chartOptions!.plugins!.tooltip!.enabled).toBe(false);
  });
});
