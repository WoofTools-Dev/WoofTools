import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

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
    const mockData = [{ id: 1, token0Name: 'WOOF', token1Name: 'BONE' }];

    service.getDashboardData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch live pairs via GET', () => {
    const mockData = [{ id: 1, token0Name: 'WOOF', token1Name: 'SHIB' }];

    service.getLivePairs().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/live-pairs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fetch swaps via GET', () => {
    const mockData = [{ id: 1, token0Name: 'WOOF', type: 'BUY' }];

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
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard/data`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
