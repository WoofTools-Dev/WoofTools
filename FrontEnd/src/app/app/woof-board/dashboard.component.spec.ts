import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule } from 'ng2-charts';

import { DashboardComponent } from './dashboard.component';
import { ApiService } from 'src/app/Service/api.service';
import { SearchService } from 'src/app/Service/search.service';
import { DashboardData, HotPair } from 'src/app/Interface/api.interfaces';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let searchService: SearchService;

  const mockDashboardData: DashboardData[] = [
    {
      id: 1, token0Name: 'BONK', token1Name: 'WETH',
      pairAddress: '0x1111', price: 0.000012, percentage24H: 15.5,
      score: 95, contracts: '0xaaa', created: new Date().toISOString(),
      volume: '1M', swaps: '500', liquidity: '200K', marketCap: '5M',
      dex: ['uniswap'], createdAt: new Date().toISOString(),
    },
    {
      id: 2, token0Name: 'DOGE', token1Name: 'USDT',
      pairAddress: '0x2222', price: 0.15, percentage24H: -3.2,
      score: 80, contracts: '0xbbb', created: new Date().toISOString(),
      volume: '500K', swaps: '200', liquidity: '100K', marketCap: '2M',
      dex: ['uniswap'], createdAt: new Date().toISOString(),
    },
  ];

  const mockHotPairs: HotPair[] = [
    {
      id: 1, pairName: 'BONK/WETH', popularity: 100,
      price: 0.000012, previousPrices: [1, 2, 3, 4, 5], growthPercentage: 10,
    },
    {
      id: 2, pairName: 'DOGE/USDT', popularity: 80,
      price: 0.15, previousPrices: [5, 4, 3, 2, 1], growthPercentage: -5,
    },
  ];

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getDashboardData', 'getHotPairs']);
    apiSpy.getDashboardData.and.returnValue(of(mockDashboardData));
    apiSpy.getHotPairs.and.returnValue(of(mockHotPairs));

    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NoopAnimationsModule,
        NgChartsModule,
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        SearchService,
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

  it('should load rankings sorted by score', () => {
    expect(component.rankings.length).toBe(2);
    expect(component.rankings[0].name).toBe('BONK');
    expect(component.rankings[1].name).toBe('DOGE');
  });

  it('should load hot pairs', () => {
    expect(component.hotPairsList.length).toBe(2);
    expect(component.selectedPair?.pairName).toBe('BONK/WETH');
  });

  it('should select a pair', () => {
    const secondPair = component.hotPairsList[1];
    component.selectPair(secondPair);
    expect(component.selectedPair).toBe(secondPair);
  });

  it('should filter table via search service', fakeAsync(() => {
    searchService.setQuery('BONK');
    tick();
    expect(component.dataSource.filter).toBe('bonk');
  }));

  it('should filter rankings via search', fakeAsync(() => {
    searchService.setQuery('DOGE');
    tick();
    expect(component.filteredRankings1.length).toBe(1);
    expect(component.filteredRankings1[0].name).toBe('DOGE');
    expect(component.filteredRankings2.length).toBe(0);
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
    expect(component.filteredHotPairs.length).toBe(1);

    searchService.setQuery('');
    tick();
    expect(component.filteredHotPairs.length).toBe(2);
    expect(component.filteredRankings1.length + component.filteredRankings2.length).toBe(2);
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
    component.ngOnInit();
    expect(component.dataLoaded).toBe(true);
  });
});
