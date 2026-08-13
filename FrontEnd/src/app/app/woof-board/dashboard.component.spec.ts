import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

Chart.register(...registerables, CandlestickController, CandlestickElement);

import { DashboardComponent } from './dashboard.component';
import { TokenChartComponent } from '../chart/chart.component';
import { CandlestickChartComponent } from 'src/app/charts/candlestick-chart/candlestick-chart.component';
import { CandleDataService } from 'src/app/charts/candle-data.service';
import { ApiService } from 'src/app/Service/api.service';
import { SearchService } from 'src/app/Service/search.service';
import { ChainService } from 'src/app/Service/chain.service';
import { WalletService } from 'src/app/provider/walletprovider';
import { DashboardData, HotPair, DailyWinner, DailyLoser, UpdatedRRSS, LikeStatus } from 'src/app/Interface/api.interfaces';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let searchService: SearchService;
  let walletConnected: boolean;

  const mockLikeStatus: LikeStatus = {
    entityType: 'dashboard',
    entityId: 1,
    count: 96,
    likedByMe: true,
    myCount: 1,
    remaining: 19,
    maxLikes: 20,
    walletAddress: '0xabc',
  };

  const mockDashboardData: DashboardData[] = [
    {
      id: 1, token0Name: 'BONK', token1Name: 'WETH',
      pairAddress: '0x1111', price: 0.000012, percentage24H: 15.5,
      score: 95, contracts: '0xaaa', created: new Date().toISOString(),
      volume: '1M', swaps: '500', liquidity: '200K', marketCap: '5M',
      dex: ['uniswap'], chain: 'ethereum', createdAt: new Date().toISOString(),
    },
    {
      id: 2, token0Name: 'DOGE', token1Name: 'USDT',
      pairAddress: '0x2222', price: 0.15, percentage24H: -3.2,
      score: 80, contracts: '0xbbb', created: new Date().toISOString(),
      volume: '500K', swaps: '200', liquidity: '100K', marketCap: '2M',
      dex: ['uniswap'], chain: 'ethereum', createdAt: new Date().toISOString(),
    },
  ];

  const mockHotPairs: HotPair[] = [
    {
      id: 1, pairName: 'BONK/WETH', popularity: 100,
      price: 0.000012, previousPrices: [1, 2, 3, 4, 5], growthPercentage: 10,
      chain: 'ethereum',
    },
    {
      id: 2, pairName: 'DOGE/USDT', popularity: 80,
      price: 0.15, previousPrices: [5, 4, 3, 2, 1], growthPercentage: -5,
      chain: 'ethereum',
    },
  ];

  const mockWinners: DailyWinner[] = [
    {
      id: 1, username: 'BONK', date: new Date().toISOString(),
      price: 0.000012, previousPrices: [1, 2, 3, 4, 5], growthPercentage: 20,
      chain: 'ethereum',
    },
  ];

  const mockLosers: DailyLoser[] = [
    {
      id: 1, username: 'DOGE', date: new Date().toISOString(),
      price: 0.15, previousPrices: [5, 4, 3, 2, 1], growthPercentage: -8,
      chain: 'ethereum',
    },
  ];

  const mockUpdated: UpdatedRRSS[] = [
    {
      id: 1, profileName: 'SHIB', lastUpdated: new Date().toISOString(),
      price: 0.00002, previousPrices: [1, 2, 3], growthPercentage: 5,
      chain: 'ethereum',
    },
  ];

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', [
      'getDashboardData', 'getHotPairs', 'getDailyWinners', 'getDailyLosers', 'getUpdatedRRSS',
      'addLike', 'getLikeStatus',
    ]);
    apiSpy.getDashboardData.and.returnValue(of(mockDashboardData));
    apiSpy.getHotPairs.and.returnValue(of(mockHotPairs));
    apiSpy.getDailyWinners.and.returnValue(of(mockWinners));
    apiSpy.getDailyLosers.and.returnValue(of(mockLosers));
    apiSpy.getUpdatedRRSS.and.returnValue(of(mockUpdated));
    apiSpy.addLike.and.returnValue(of(mockLikeStatus));
    apiSpy.getLikeStatus.and.returnValue(of(mockLikeStatus));

    walletConnected = false;
    const walletSpy = {
      get address(): string {
        return walletConnected ? '0xabc' : '';
      },
      connectWallet: jasmine.createSpy('connectWallet').and.callFake(async () => {
        walletConnected = true;
      }),
      isWalletConnected: jasmine.createSpy('isWalletConnected').and.callFake(() => walletConnected),
    };

    TestBed.configureTestingModule({
      declarations: [DashboardComponent, TokenChartComponent],
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NoopAnimationsModule,
        NgChartsModule,
        CandlestickChartComponent,
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: WalletService, useValue: walletSpy },
        SearchService,
        ChainService,
        CandleDataService,
        { provide: Router, useValue: { url: '/woofboard', navigate: jasmine.createSpy('navigate') } },
      ],
    });

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    searchService = TestBed.inject(SearchService);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(component.tokensList.length).toBe(2);
    expect(component.tokensList[0].pairInfo.token0Name).toBe('BONK');
  });

  it('should load daily winners', () => {
    expect(component.winners.length).toBe(1);
    expect(component.winners[0].name).toBe('BONK');
    expect(component.filteredWinners.length).toBe(1);
  });

  it('should load daily losers', () => {
    expect(component.losers.length).toBe(1);
    expect(component.losers[0].name).toBe('DOGE');
    expect(component.losers[0].isPositive).toBe(false);
  });

  it('should load recently updated profiles', () => {
    expect(component.updatedRows.length).toBe(1);
    expect(component.updatedRows[0].name).toBe('SHIB');
  });

  it('should load hot pairs', () => {
    expect(component.hotPairsList.length).toBe(2);
    expect(component.filteredHotPairs.length).toBe(2);
  });

  it('should auto-select the first winner so the main chart is visible', () => {
    expect(component.selectedPair?.name).toBe('BONK');
    expect(component.selectedPair?.previousPrices).toEqual(component.winners[0].previousPrices);
  });

  it('should fallback to generated timestamps when previousTimes are absent', () => {
    expect(component.selectedPair?.previousTimes).toBeDefined();
    expect(component.selectedPair?.previousTimes!.length).toBe(component.selectedPair?.previousPrices.length);
  });

  it('should use previousTimes from API rows when provided', () => {
    component.winners[0].previousTimes = [1000, 2000, 3000, 4000, 5000];
    component.selectRow(component.winners[0]);
    expect(component.selectedPair?.previousTimes).toEqual([1000, 2000, 3000, 4000, 5000]);
  });

  it('should select a row and build the chart', () => {
    const row = component.winners[0];
    component.selectRow(row);
    expect(component.selectedPair?.name).toBe('BONK');
    expect(component.selectedPair?.previousPrices).toEqual(row.previousPrices);
  });

  it('should select a hot pair', () => {
    component.selectHotPair(component.hotPairsList[1]);
    expect(component.selectedPair?.name).toBe('DOGE/USDT');
    expect(component.selectedPair?.growthPercentage).toBe(-5);
  });

  it('should select a main table row and build the chart', () => {
    const element = component.tokensList[0];
    component.selectMainRow(element);
    expect(component.selectedPair?.name).toBe('BONK / WETH');
    expect(component.selectedPair?.previousPrices.length).toBeGreaterThan(1);
  });

  it('should filter table via search service', fakeAsync(() => {
    searchService.setQuery('BONK');
    tick();
    expect(component.dataSource.filter).toBe('bonk');
  }));

  it('should filter winners via search', fakeAsync(() => {
    searchService.setQuery('DOGE');
    tick();
    expect(component.filteredWinners.length).toBe(0);
    expect(component.filteredLosers.length).toBe(1);
    expect(component.filteredLosers[0].name).toBe('DOGE');
  }));

  it('should filter hot pairs via search', fakeAsync(() => {
    searchService.setQuery('BONK');
    tick();
    expect(component.filteredHotPairs.length).toBe(1);
    expect(component.filteredHotPairs[0].pairName).toBe('BONK/WETH');
  }));

  it('should reset filters when search is cleared', fakeAsync(() => {
    searchService.setQuery('BONK');
    tick();
    expect(component.filteredWinners.length).toBe(1);
    expect(component.filteredHotPairs.length).toBe(1);

    searchService.setQuery('');
    tick();
    expect(component.filteredWinners.length).toBe(1);
    expect(component.filteredLosers.length).toBe(1);
    expect(component.filteredHotPairs.length).toBe(2);
  }));

  it('should format time elapsed correctly', () => {
    const now = new Date().toISOString();
    expect(component.getTimeElapsed(now)).toContain('hour');
  });

  it('should set dataLoaded true after successful fetch', () => {
    expect(component.dataLoaded).toBe(true);
  });

  it('should initialize dataSource with data', () => {
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should set dataLoaded true on error', () => {
    apiService.getDashboardData.and.returnValue(of([]));
    apiService.getHotPairs.and.returnValue(of([]));
    apiService.getDailyWinners.and.returnValue(of([]));
    apiService.getDailyLosers.and.returnValue(of([]));
    apiService.getUpdatedRRSS.and.returnValue(of([]));
    component['loadData']('ethereum');
    expect(component.dataLoaded).toBe(true);
  });

  it('should pass wallet address to API calls when connected', () => {
    walletConnected = true;
    component['loadData']('ethereum');
    expect(apiService.getDashboardData).toHaveBeenCalledWith('ethereum', '0xabc');
    expect(apiService.getHotPairs).toHaveBeenCalledWith('ethereum', '0xabc');
  });

  it('should connect wallet before liking when not connected', async () => {
    walletConnected = false;
    await component.connectWallet();
    expect(walletConnected).toBe(true);
    expect(apiService.getDashboardData).toHaveBeenCalled();
  });

  it('should like a hot pair and update its popularity', () => {
    walletConnected = true;
    const pair = component.hotPairsList[0];
    component.likeHotPair(pair);
    expect(apiService.addLike).toHaveBeenCalledWith('hotpair', 1, '0xabc');
    expect(pair.popularity).toBe(96);
    expect(pair.likedByMe).toBe(true);
  });

  it('should like a dashboard row and update its score', () => {
    walletConnected = true;
    const element = component.tokensList[0];
    component.likeDashboard(element);
    expect(apiService.addLike).toHaveBeenCalledWith('dashboard', 1, '0xabc');
    expect(element.score).toBe(96);
    expect(element.likedByMe).toBe(true);
    expect(element.remainingLikes).toBe(19);
  });

  it('should not like a dashboard row when like limit is reached', () => {
    walletConnected = true;
    const element = component.tokensList[0];
    element.remainingLikes = 0;
    component.likeDashboard(element);
    expect(apiService.addLike).not.toHaveBeenCalledWith('dashboard', 1, '0xabc');
  });
});
