import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

Chart.register(...registerables, CandlestickController, CandlestickElement);

import { MultiChartComponent } from './multichart.component';
import { TokenChartComponent } from '../chart/chart.component';
import { ApiService } from 'src/app/Service/api.service';
import { ChainService } from 'src/app/Service/chain.service';
import { HotPair } from 'src/app/Interface/api.interfaces';

describe('MultiChartComponent', () => {
  let component: MultiChartComponent;
  let fixture: ComponentFixture<MultiChartComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockHotPairs: HotPair[] = [
    {
      id: 1, pairName: 'BONE/WETH', popularity: 90,
      price: 0.5, previousPrices: [1, 2, 3, 4, 5], growthPercentage: 12,
      chain: 'ethereum',
    },
  ];

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getHotPairs']);
    apiSpy.getHotPairs.and.returnValue(of(mockHotPairs));

    TestBed.configureTestingModule({
      declarations: [MultiChartComponent, TokenChartComponent],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        NgChartsModule,
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        ChainService,
      ],
    });
    fixture = TestBed.createComponent(MultiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load chart cards for the active chain', () => {
    expect(component.cards.length).toBe(1);
    expect(component.cards[0].pairName).toBe('BONE/WETH');
  });

  it('should use previousPrices for the chart data', () => {
    expect(component.cards[0].prices).toEqual([1, 2, 3, 4, 5]);
  });

  it('should fallback to generated timestamps when previousTimes are absent', () => {
    expect(component.cards[0].times.length).toBe(5);
    expect(component.cards[0].times[1] - component.cards[0].times[0]).toBe(3600);
  });

  it('should use previousTimes when provided', () => {
    apiSpy.getHotPairs.and.returnValue(of([{
      id: 3, pairName: 'Y/Z', popularity: 50,
      previousPrices: [1, 2, 3], previousTimes: [1000, 2000, 3000],
      growthPercentage: 0, chain: 'ethereum',
    }]));
    component['fetchData']();
    expect(component.cards[0].times).toEqual([1000, 2000, 3000]);
  });

  it('should fallback to default series when prices are too short', () => {
    apiSpy.getHotPairs.and.returnValue(of([{
      id: 2, pairName: 'X/Y', popularity: 10,
      previousPrices: [1], growthPercentage: 0, chain: 'ethereum',
    }]));
    component['fetchData']();
    expect(component.cards[0].prices.length).toBeGreaterThan(1);
  });
});
