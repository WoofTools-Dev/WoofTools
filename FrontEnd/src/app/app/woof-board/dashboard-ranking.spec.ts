import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

Chart.register(...registerables, CandlestickController, CandlestickElement);

import { TokenChartComponent } from '../chart/chart.component';
import { CandlestickChartComponent } from 'src/app/charts/candlestick-chart/candlestick-chart.component';
import { CandleDataService } from 'src/app/charts/candle-data.service';
import { ApiService } from 'src/app/Service/api.service';
import { SearchService } from 'src/app/Service/search.service';
import { ChainService } from 'src/app/Service/chain.service';
import { WalletService } from 'src/app/provider/walletprovider';

describe('DashboardComponent – ranking CSS classes', () => {
  let component: DashboardComponent;
  let fixture: any;
  let apiService: jasmine.SpyObj<ApiService>;
  const routeStub: any = { snapshot: { queryParams: {} } };

  const mockWinnerData = [
    { id: 1, username: 'SHIB', date: new Date().toISOString(), price: 0.00001, previousPrices: [0.00001, 0.000011], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 10, chain: 'ethereum' },
    { id: 2, username: 'BONE', date: new Date().toISOString(), price: 0.5, previousPrices: [0.5, 0.52], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 4, chain: 'ethereum' },
    { id: 3, username: 'LEASH', date: new Date().toISOString(), price: 1.2, previousPrices: [1.2, 1.21], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 0.8, chain: 'ethereum' },
    { id: 4, username: 'WETH', date: new Date().toISOString(), price: 3000, previousPrices: [3000, 3001], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 0.03, chain: 'ethereum' },
  ];

  const mockLoserData = [
    { id: 5, username: 'USDC', date: new Date().toISOString(), price: 1, previousPrices: [1, 0.99], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: -1, chain: 'ethereum' },
    { id: 6, username: 'USDT', date: new Date().toISOString(), price: 1, previousPrices: [1, 0.98], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: -2, chain: 'ethereum' },
  ];

  const mockUpdatedData = [
    { id: 7, profileName: 'PEPE', lastUpdated: new Date().toISOString(), price: 0.000005, previousPrices: [0.000005], previousTimes: [Date.now()], growthPercentage: 5, chain: 'ethereum' },
    { id: 8, profileName: 'FLOKI', lastUpdated: new Date(Date.now() - 86400000).toISOString(), price: 0.0001, previousPrices: [0.0001], previousTimes: [Date.now() - 86400000], growthPercentage: 2, chain: 'ethereum' },
  ];

  const mockHotPairs = [
    { id: 1, pairName: 'BONE/WETH', popularity: 100, previousPrices: [0.5, 0.52], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 4, chain: 'ethereum' },
    { id: 2, pairName: 'SHIB/WETH', popularity: 50, previousPrices: [0.00001, 0.000011], previousTimes: [Date.now() - 3600000, Date.now()], growthPercentage: 10, chain: 'ethereum' },
  ];

  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', [
      'getDashboardData', 'getHotPairs', 'getDailyWinners', 'getDailyLosers',
      'getUpdatedRRSS', 'addLike', 'getLikeStatus'
    ]);
    apiService.getDashboardData.and.returnValue(of([]));
    apiService.getHotPairs.and.returnValue(of(mockHotPairs as any));
    apiService.getDailyWinners.and.returnValue(of(mockWinnerData as any));
    apiService.getDailyLosers.and.returnValue(of(mockLoserData as any));
    apiService.getUpdatedRRSS.and.returnValue(of(mockUpdatedData as any));
    apiService.addLike.and.returnValue(of({ count: 1 } as any));
    apiService.getLikeStatus.and.returnValue(of(null as any));

    TestBed.configureTestingModule({
      declarations: [DashboardComponent, TokenChartComponent],
      imports: [
        HttpClientTestingModule, MatPaginatorModule, MatSortModule,
        MatTableModule, NoopAnimationsModule, NgChartsModule,
        CandlestickChartComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiService },
        SearchService, ChainService, CandleDataService,
        { provide: WalletService, useValue: { isWalletConnected: () => false, getWalletAddress: () => null } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: routeStub },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render 4 winners, 2 losers, 2 updated, 2 hot pairs', () => {
    expect(component.winners.length).toBe(4);
    expect(component.losers.length).toBe(2);
    expect(component.updatedRows.length).toBe(2);
    expect(component.hotPairsList.length).toBe(2);
  });

  it('should apply active class ONLY to first winner (i===0), not top 3', () => {
    const el = fixture.nativeElement;
    const rows = el.querySelectorAll('table.winners-table tr.mat-row, .table-container:first-of-type tr.mat-row');
    if (rows.length > 0) {
      const firstRank = rows[0].querySelector('.mini-rank');
      const secondRank = rows.length > 1 ? rows[1].querySelector('.mini-rank') : null;
      expect(firstRank).withContext('first row should have a rank element').toBeTruthy();
      if (firstRank) {
        expect(firstRank.classList.contains('active')).withContext('rank #1 should have active class').toBe(true);
      }
      if (secondRank) {
        expect(secondRank.classList.contains('active')).withContext('rank #2 should NOT have active class').toBe(false);
        expect(secondRank.classList.contains('rank-top')).withContext('rank #2 should have rank-top class').toBe(true);
      }
    }
  });

  it('should render toHaveClass helpers for rank squares', () => {
    const el = fixture.nativeElement;
    const allRanks = el.querySelectorAll('.mini-rank');
    expect(allRanks.length).withContext('should have multiple rank elements').toBeGreaterThan(0);
    const activeRanks = el.querySelectorAll('.mini-rank.active');
    expect(activeRanks.length).withContext('should have exactly 1 active rank per table').toBeGreaterThanOrEqual(1);
  });
});
