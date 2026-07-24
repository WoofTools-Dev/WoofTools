import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { DashboardData, LivePair, SwapTransaction } from '../Interface/api.interfaces';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard data via GET', () => {
    const mockData: DashboardData[] = [{
      id: 1, token0Name: 'WOOF', token1Name: 'BONE',
      pairAddress: '0x123', price: 1.5, percentage24H: 5.2,
      score: 90, contracts: '0xabc', created: new Date().toISOString(),
      volume: '1M', swaps: '100', liquidity: '500K', marketCap: '10M',
      dex: ['uniswap'], createdAt: new Date().toISOString(),
    }];

    service.getDashboardData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch live pairs via GET', () => {
    const mockData: LivePair[] = [{
      id: 1, token0Name: 'WOOF', token1Name: 'SHIB',
      pairAddress: '0x456', listedSince: new Date().toISOString(),
      tokenPriceUSD: 0.001, initialLiquidity: '1 ETH',
      totalLiquidity: '50%', poolAmount: '2 ETH',
      poolVariation: 25, poolRemaining: '3 ETH',
      contract: '0xdef', createdAt: new Date().toISOString(),
    }];

    service.getLivePairs().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/live-pairs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch swaps via GET', () => {
    const mockData: SwapTransaction[] = [{
      id: 1, token0Name: 'WOOF', token1Name: 'SHIB',
      pairAddress: '0x789', executionTime: new Date().toISOString(),
      type: 'BUY', quantity: 1000, totalETH: 2.5,
      totalUSD: 5000, variation: 5.5, maker: '0xmkr',
      createdAt: new Date().toISOString(),
    }];

    service.getSwaps().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/swaps`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle HTTP errors', () => {
    spyOn(console, 'error');

    service.getDashboardData().subscribe({
      next: () => fail('expected an error'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toContain('Http failure response');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
