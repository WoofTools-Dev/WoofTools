import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { StatsComponent } from './stats.component';
import { ApiService } from 'src/app/Service/api.service';
import { ChainService } from 'src/app/Service/chain.service';
import { DashboardData, SwapTransaction } from 'src/app/Interface/api.interfaces';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockDashboard: DashboardData[] = [
    {
      id: 1, token0Name: 'BONE', token1Name: 'WETH',
      pairAddress: '0x1', price: 1, percentage24H: 20,
      score: 90, contracts: '0x', created: new Date().toISOString(),
      volume: '1M', swaps: '500', liquidity: '200K', marketCap: '5M',
      dex: ['uniswap'], chain: 'ethereum', createdAt: new Date().toISOString(),
    },
  ];

  const mockSwaps: SwapTransaction[] = [
    {
      id: 1, token0Name: 'BONE', token1Name: 'WETH',
      pairAddress: '0x1', executionTime: new Date().toISOString(),
      type: 'BUY', quantity: 10, totalETH: 1, totalUSD: 100000,
      variation: 5, maker: '0xmaker', chain: 'ethereum', createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('ApiService', ['getDashboardData', 'getSwaps', 'getHotPairs']);
    apiSpy.getDashboardData.and.returnValue(of(mockDashboard));
    apiSpy.getSwaps.and.returnValue(of(mockSwaps));
    apiSpy.getHotPairs.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [StatsComponent],
      imports: [HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        ChainService,
      ],
    });
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build stat cards', () => {
    expect(component.cards.length).toBe(6);
    expect(component.cards.find(c => c.label === 'Total Pairs')?.value).toBe('1');
  });

  it('should build top makers from swap volume', () => {
    expect(component.topMakers.length).toBe(1);
    expect(component.topMakers[0].address).toBe('0xmaker');
  });

  it('should build top gainers', () => {
    expect(component.topGainers.length).toBe(1);
    expect(component.topGainers[0].change).toBe(20);
  });
});
