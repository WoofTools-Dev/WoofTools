import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

import { TokenChartComponent } from './chart.component';

Chart.register(...registerables, CandlestickController, CandlestickElement);

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

  it('should keep tooltips enabled even when showAxes is false', () => {
    component.data = [1, 2, 3];
    component.showAxes = false;
    component.ngOnChanges({});
    expect(component.chartOptions!.plugins!.tooltip!.enabled).toBe(true);
  });

  // Candlestick tests
  it('should build candlestick chart when chartType is candlestick', () => {
    component.data = [100, 101, 102, 99, 98];
    component.chartType = 'candlestick';
    component.ngOnChanges({});
    expect(component.type).toBe('candlestick');
    expect(component.chartData).toBeDefined();
    expect(component.chartData!.datasets[0].data!.length).toBe(4);
  });

  it('should not generate candlestick data with less than 2 prices', () => {
    component.data = [100];
    component.chartType = 'candlestick';
    component.ngOnChanges({});
    expect(component.chartData).toBeUndefined();
  });

  it('candlestick OHLC should have correct structure', () => {
    component.data = [100, 102, 98];
    component.chartType = 'candlestick';
    component.ngOnChanges({});
    const points = component.chartData!.datasets[0].data as any[];
    expect(points.length).toBe(2);
    expect(points[0].o).toBe(100);
    expect(points[0].c).toBe(102);
    expect(points[0].h).toBeGreaterThan(points[0].c);
    expect(points[0].l).toBeLessThan(points[0].o);
    expect(points[1].o).toBe(102);
    expect(points[1].c).toBe(98);
    expect(points[1].h).toBeGreaterThan(points[1].o);
    expect(points[1].l).toBeLessThan(points[1].c);
  });

  // Professional chart tests
  it('should set y-axis position to right for line chart with axes', () => {
    component.data = [1, 2, 3];
    component.chartType = 'line';
    component.showAxes = true;
    component.ngOnChanges({});
    expect((component.chartOptions!.scales!['y'] as any).position).toBe('right');
  });

  it('should set y-axis position to right for candlestick chart with axes', () => {
    component.data = [1, 2, 3];
    component.chartType = 'candlestick';
    component.showAxes = true;
    component.ngOnChanges({});
    expect((component.chartOptions!.scales!['y'] as any).position).toBe('right');
  });

  it('should include crosshair plugin when showAxes is true', () => {
    component.data = [1, 2, 3];
    component.showAxes = true;
    component.ngOnChanges({});
    expect(component.plugins.length).toBe(1);
    expect(component.plugins[0].id).toBe('crosshair');
  });

  it('should not include crosshair plugin when showAxes is false', () => {
    component.data = [1, 2, 3];
    component.showAxes = false;
    component.ngOnChanges({});
    expect(component.plugins.length).toBe(0);
  });

  it('should use thin candle spacing for candlestick with axes', () => {
    component.data = [100, 101, 102, 99, 98];
    component.chartType = 'candlestick';
    component.showAxes = true;
    component.ngOnChanges({});
    const ds = component.chartData!.datasets[0] as any;
    expect(ds.barPercentage).toBe(0.35);
    expect(ds.categoryPercentage).toBe(0.9);
  });

  it('should use slightly wider candle spacing for candlestick without axes', () => {
    component.data = [100, 101, 102, 99, 98];
    component.chartType = 'candlestick';
    component.showAxes = false;
    component.ngOnChanges({});
    const ds = component.chartData!.datasets[0] as any;
    expect(ds.barPercentage).toBe(0.5);
    expect(ds.categoryPercentage).toBe(0.95);
  });

  it('should have only one dataset (no SMA overlay)', () => {
    component.data = [100, 102, 101, 99, 98];
    component.chartType = 'candlestick';
    component.ngOnChanges({});
    expect(component.chartData!.datasets.length).toBe(1);
  });
});
