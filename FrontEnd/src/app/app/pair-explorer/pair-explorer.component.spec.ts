import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PairExplorerComponent } from './pair-explorer.component';
import { ApiService } from 'src/app/Service/api.service';
import { ChainService } from 'src/app/Service/chain.service';
import { LivePair } from 'src/app/Interface/api.interfaces';
import { Router } from '@angular/router';

describe('PairExplorerComponent', () => {
  let component: PairExplorerComponent;
  let fixture: ComponentFixture<PairExplorerComponent>;

  const mockLivePairs: LivePair[] = [
    {
      id: 1, token0Name: 'BONE', token1Name: 'SHIB',
      pairAddress: '0x111', listedSince: new Date().toISOString(),
      tokenPriceUSD: 0.5, initialLiquidity: '1 BONE',
      totalLiquidity: '50%', poolAmount: '2 BONE',
      poolVariation: 10, poolRemaining: '3 BONE',
      contract: '0xabc', chain: 'shibarium', createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['getLivePairs']);
    apiSpy.getLivePairs.and.returnValue(of(mockLivePairs));

    TestBed.configureTestingModule({
      declarations: [PairExplorerComponent],
      imports: [
        HttpClientTestingModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ApiService, useValue: apiSpy },
        ChainService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    });
    fixture = TestBed.createComponent(PairExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pairs for the active chain', () => {
    expect(component.pairs.length).toBe(1);
    expect(component.pairs[0].token0Name).toBe('BONE');
    expect(component.pairs[0].id).toBe(1);
    expect(component.activeChain).toBe('shibarium');
  });

  it('should filter pairs via search', () => {
    component.search({ target: { value: 'SHIB' } });
    expect(component.dataSource.filter).toBe('shib');
  });

  it('should build explorer url from active chain', () => {
    const url = component.buildExplorerUrl(component.pairs[0]);
    expect(url).toContain('shibariumscan.io');
    expect(url).toContain('0x111');
  });

  it('should navigate to multichart adding the pair by id', () => {
    const router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    component.addToMultiChart(component.pairs[0]);
    expect(router.navigate).toHaveBeenCalledWith(['/multichart'], {
      queryParams: { network: 'shibarium', add: 'live-1' },
    });
  });
});
