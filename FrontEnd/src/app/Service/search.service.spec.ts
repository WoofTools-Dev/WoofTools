import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty query', () => {
    expect(service.getQuery()).toBe('');
  });

  it('should update query via setQuery', () => {
    service.setQuery('WETH');
    expect(service.getQuery()).toBe('WETH');
  });

  it('should emit new value on query$ observable', () => {
    const emitted: string[] = [];
    service.query$.subscribe(q => emitted.push(q));

    service.setQuery('PEPE');
    service.setQuery('USDC');

    expect(emitted).toEqual(['', 'PEPE', 'USDC']);
  });

  it('should replay last value to late subscribers', () => {
    service.setQuery('BONK');

    const emitted: string[] = [];
    service.query$.subscribe(q => emitted.push(q));

    expect(emitted).toEqual(['BONK']);
  });

  it('should handle empty string reset', () => {
    service.setQuery('ETH');
    service.setQuery('');

    expect(service.getQuery()).toBe('');
  });
});
