import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

Chart.register(...registerables, CandlestickController, CandlestickElement);

import { MultiChartComponent } from './multichart.component';
import { CandlestickChartComponent } from 'src/app/charts/candlestick-chart/candlestick-chart.component';
import { CandleDataService } from 'src/app/charts/candle-data.service';
import { ApiService } from 'src/app/Service/api.service';
import { ChainService } from 'src/app/Service/chain.service';
import { HotPair, LivePair } from 'src/app/Interface/api.interfaces';
import { Router, ActivatedRoute } from '@angular/router';

describe('MultiChartComponent', () => {
  let component: MultiChartComponent;
  let fixture: ComponentFixture<MultiChartComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;
  const routeStub: any = { snapshot: { queryParams: {} } };

  const mockHotPairs: HotPair[] = [
    {
      id: 1, pairName: 'BONE/WETH', popularity: 90,
      price: 0.5, previousPrices: [1, 2, 3, 4, 5], growthPercentage: 12,
      chain: 'shibarium',
    },
  ];

  const mockLivePairs: LivePair[] = [
    {
      id: 10, token0Name: 'FLUFFY', token1Name: 'WETH', pairAddress: '0xabc',
      listedSince: new Date().toISOString(), tokenPriceUSD: 0.001,
      initialLiquidity: '10 ETH', totalLiquidity: '25 ETH', poolAmount: '12 ETH',
      poolVariation: 45, poolRemaining: '8 ETH', contract: '0xdef',
      chain: 'shibarium', createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    routeStub.snapshot.queryParams = {};
    apiSpy = jasmine.createSpyObj('ApiService', ['getHotPairs', 'getLivePairs']);
    apiSpy.getHotPairs.and.returnValue(of(mockHotPairs));
    apiSpy.getLivePairs.and.returnValue(of(mockLivePairs));

    TestBed.configureTestingModule({
      declarations: [MultiChartComponent],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        NgChartsModule,
        CandlestickChartComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        ChainService,
        CandleDataService,
        { provide: Router, useValue: { url: '/multichart', navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    });
    fixture = TestBed.createComponent(MultiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function findOption(name: string) {
    return component.pool.find((o) => o.name === name)!;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hot and live pair options with stable ids', () => {
    expect(component.pool.length).toBe(2);
    const hot = findOption('BONE/WETH');
    const live = findOption('FLUFFY / WETH');
    expect(hot.id).toBe('hot-1');
    expect(live.id).toBe('live-10');
  });

  it('should filter options by query', () => {
    component.query = 'fluffy';
    component['applyQueryFilter']();
    expect(component.filteredOptions.length).toBe(1);
    expect(component.filteredOptions[0].name).toBe('FLUFFY / WETH');
  });

  it('should add a card using the stable option id', () => {
    component.addCard(findOption('BONE/WETH'));
    expect(component.cards.length).toBe(1);
    expect(component.cards[0].id).toBe('hot-1');
  });

  it('should not add more than two cards', () => {
    component.addCard(findOption('BONE/WETH'));
    component.addCard(findOption('FLUFFY / WETH'));
    component.addCard(findOption('BONE/WETH'));
    expect(component.cards.length).toBe(2);
    expect(component.pickerLocked).toBe(true);
  });

  it('should remove a card', () => {
    component.addCard(findOption('BONE/WETH'));
    component.addCard(findOption('FLUFFY / WETH'));
    component.removeCard(component.cards[0].id);
    expect(component.cards.length).toBe(1);
    expect(component.cards[0].id).toBe('live-10');
  });

  it('should clear all cards', () => {
    component.addCard(findOption('BONE/WETH'));
    component.clearCards();
    expect(component.cards.length).toBe(0);
  });

  it('should persist cards to localStorage per chain', () => {
    component.addCard(findOption('BONE/WETH'));
    const raw = localStorage.getItem(component['storageKey']());
    expect(raw).toBeDefined();
    const stored = JSON.parse(raw!);
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('hot-1');
  });

  it('should drop persisted cards whose id is no longer in the list', () => {
    component.addCard(findOption('BONE/WETH'));
    const key = component['storageKey']();
    const stored = JSON.parse(localStorage.getItem(key)!);
    stored[0].id = 'hot-999';
    localStorage.setItem(key, JSON.stringify(stored));

    component['fetchData']();
    expect(component.cards.length).toBe(0);
    expect(JSON.parse(localStorage.getItem(key)!).length).toBe(0);
  });

  it('should auto-add a pair requested via query params', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    routeStub.snapshot.queryParams = { network: 'shibarium', add: 'hot-1' };
    component['fetchData']();
    expect(component.cards.length).toBe(1);
    expect(component.cards[0].id).toBe('hot-1');
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { add: null, network: null },
      queryParamsHandling: 'merge',
    });
  });

  it('should navigate to swap with the token query params', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component.addCard(findOption('BONE/WETH'));
    component.swapToken(component.cards[0], component.cards[0].token0);
    expect(router.navigate).toHaveBeenCalledWith(['/multiswap'], {
      queryParams: { network: component.activeChain, token: 'BONE' },
    });
  });

  it('should use previousPrices for the chart data', () => {
    const card = findOption('BONE/WETH');
    expect(card.prices).toEqual([1, 2, 3, 4, 5]);
  });

  it('should fallback to generated timestamps when previousTimes are absent', () => {
    const card = findOption('BONE/WETH');
    expect(card.times.length).toBe(5);
    expect(card.times[1] - card.times[0]).toBe(3600);
  });

  it('should use previousTimes when provided', () => {
    apiSpy.getHotPairs.and.returnValue(of([{
      id: 3, pairName: 'Y/Z', popularity: 50,
      previousPrices: [1, 2, 3], previousTimes: [1000, 2000, 3000],
      growthPercentage: 0, chain: 'shibarium',
    }]));
    apiSpy.getLivePairs.and.returnValue(of([]));
    component['fetchData']();
    const card = findOption('Y/Z');
    expect(card.times).toEqual([1000, 2000, 3000]);
  });
});
