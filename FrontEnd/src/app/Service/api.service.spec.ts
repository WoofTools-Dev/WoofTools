import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { DashboardData, HotPair, LivePair, SwapTransaction, LikeStatus } from '../Interface/api.interfaces';

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
      dex: ['uniswap'], chain: 'ethereum', createdAt: new Date().toISOString(),
    }];

    service.getDashboardData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch dashboard data filtered by chain', () => {
    service.getDashboardData('shibarium').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data?chain=shibarium`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch dashboard data with wallet address for like info', () => {
    service.getDashboardData('ethereum', '0xwallet').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data?chain=ethereum&walletAddress=0xwallet`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch hot pairs via GET', () => {
    const mockData: HotPair[] = [{
      id: 1, pairName: 'WOOF/SHIB', popularity: 100,
      price: 0.001, previousPrices: [1, 2, 3], growthPercentage: 5,
      chain: 'ethereum',
    }];

    service.getHotPairs().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/hotpair/hot-pairs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch hot pairs with wallet address for like info', () => {
    service.getHotPairs('ethereum', '0xwallet').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/hotpair/hot-pairs?chain=ethereum&walletAddress=0xwallet`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch live pairs via GET', () => {
    const mockData: LivePair[] = [{
      id: 1, token0Name: 'WOOF', token1Name: 'SHIB',
      pairAddress: '0x456', listedSince: new Date().toISOString(),
      tokenPriceUSD: 0.001, initialLiquidity: '1 ETH',
      totalLiquidity: '50%', poolAmount: '2 ETH',
      poolVariation: 25, poolRemaining: '3 ETH',
      contract: '0xdef', chain: 'ethereum', createdAt: new Date().toISOString(),
    }];

    service.getLivePairs().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/live-pairs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch live pairs filtered by chain', () => {
    service.getLivePairs('shibarium').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/api/live-pairs?chain=shibarium`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should fetch swaps via GET', () => {
    const mockData: SwapTransaction[] = [{
      id: 1, token0Name: 'WOOF', token1Name: 'SHIB',
      pairAddress: '0x789', executionTime: new Date().toISOString(),
      type: 'BUY', quantity: 1000, totalETH: 2.5,
      totalUSD: 5000, variation: 5.5, maker: '0xmkr',
      chain: 'ethereum', createdAt: new Date().toISOString(),
    }];

    service.getSwaps().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/swaps`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch swaps filtered by chain', () => {
    service.getSwaps('shibarium').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/api/swaps?chain=shibarium`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
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

  it('should post a like', () => {
    const mockStatus: LikeStatus = {
      entityType: 'hotpair',
      entityId: 7,
      count: 101,
      likedByMe: true,
      myCount: 1,
      remaining: 19,
      maxLikes: 20,
      walletAddress: '0xwallet',
    };

    service.addLike('hotpair', 7, '0xwallet').subscribe(status => {
      expect(status).toEqual(mockStatus);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/likes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ entityType: 'hotpair', entityId: 7, walletAddress: '0xwallet' });
    req.flush(mockStatus);
  });

  it('should fetch like status via GET', () => {
    service.getLikeStatus('dashboard', 1, '0xwallet').subscribe(() => {});

    const req = httpMock.expectOne(`${environment.apiUrl}/api/likes/status?entityType=dashboard&entityId=1&walletAddress=0xwallet`);
    expect(req.request.method).toBe('GET');
    req.flush({
      entityType: 'dashboard',
      entityId: 1,
      count: 5,
      likedByMe: false,
      myCount: 0,
      remaining: 20,
      maxLikes: 20,
      walletAddress: '0xwallet',
    });
  });
});
