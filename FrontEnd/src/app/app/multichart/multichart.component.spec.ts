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
import { HotPair, LivePair } from 'src/app/Interface/api.interfaces';
import { Router } from '@angular/router';

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

  const mockLivePairs: LivePair[] = [
    {
      id: 10, token0Name: 'FLUFFY', token1Name: 'WETH', pairAddress: '0xabc',
      listedSince: new Date().toISOString(), tokenPriceUSD: 0.001,
      initialLiquidity: '10 ETH', totalLiquidity: '25 ETH', poolAmount: '12 ETH',
      poolVariation: 45, poolRemaining: '8 ETH', contract: '0xdef',
      chain: 'ethereum', createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    apiSpy = jasmine.createSpyObj('ApiService', ['getHotPairs', 'getLivePairs']);
    apiSpy.getHotPairs.and.returnValue(of(mockHotPairs));
    apiSpy.getLivePairs.and.returnValue(of(mockLivePairs));

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
        { provide: Router, useValue: { url: '/multichart', navigate: jasmine.createSpy('navigate') } },
      ],
    });
    fixture = TestBed.createComponent(MultiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hot and live pair options for the active chain', () => {
    expect(component.pool.length).toBe(2);
    expect(component.pool.some((o) => o.name === 'BONE/WETH')).toBe(true);
    expect(component.pool.some((o) => o.name === 'FLUFFY / WETH')).toBe(true);
  });

  it('should filter options by query', () => {
    component.query = 'fluffy';
    component['applyQueryFilter']();
    expect(component.filteredOptions.length).toBe(1);
    expect(component.filteredOptions[0].name).toBe('FLUFFY / WETH');
  });

  it('should add a card from an option', () => {
    const option = component.pool.find((o) => o.name === 'BONE/WETH')!;
    component.addCard(option);
    expect(component.cards.length).toBe(1);
    expect(component.cards[0].name).toBe('BONE/WETH');
    expect(component.cards[0].id).toBeDefined();
  });

  it('should not add more than two cards', () => {
    component.addCard(component.pool[0]);
    component.addCard(component.pool[1]);
    component.addCard(component.pool[0]);
    expect(component.cards.length).toBe(2);
    expect(component.pickerLocked).toBe(true);
  });

  it('should remove a card', () => {
    component.addCard(component.pool[0]);
    component.addCard(component.pool[1]);
    component.removeCard(component.cards[0].id);
    expect(component.cards.length).toBe(1);
  });

  it('should clear all cards', () => {
    component.addCard(component.pool[0]);
    component.clearCards();
    expect(component.cards.length).toBe(0);
  });

  it('should persist cards to localStorage per chain', () => {
    component.addCard(component.pool[0]);
    const raw = localStorage.getItem(component['storageKey']());
    expect(raw).toBeDefined();
    expect(JSON.parse(raw!).length).toBe(1);
  });

  it('should navigate to swap with the token query params', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    const option = component.pool.find((o) => o.name === 'BONE/WETH')!;
    component.addCard(option);
    component.swapCard(component.cards[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/multiswap'], {
      queryParams: { network: component.activeChain, token: 'BONE', pair: 'BONE/WETH' },
    });
  });

  it('should use previousPrices for the chart data', () => {
    const card = component.pool.find((o) => o.name === 'BONE/WETH')!;
    expect(card.prices).toEqual([1, 2, 3, 4, 5]);
  });

  it('should fallback to generated timestamps when previousTimes are absent', () => {
    const card = component.pool.find((o) => o.name === 'BONE/WETH')!;
    expect(card.times.length).toBe(5);
    expect(card.times[1] - card.times[0]).toBe(3600);
  });

  it('should use previousTimes when provided', () => {
    apiSpy.getHotPairs.and.returnValue(of([{
      id: 3, pairName: 'Y/Z', popularity: 50,
      previousPrices: [1, 2, 3], previousTimes: [1000, 2000, 3000],
      growthPercentage: 0, chain: 'ethereum',
    }]));
    apiSpy.getLivePairs.and.returnValue(of([]));
    component['fetchData']();
    const card = component.pool.find((o) => o.name === 'Y/Z')!;
    expect(card.times).toEqual([1000, 2000, 3000]);
  });
});
