import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, interval } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { LivePair } from 'src/app/Interface/api.interfaces';
import { getTokenIcon } from 'src/app/Service/token-icons';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey, ChainMeta } from 'src/app/Service/chain.constants';
import { generateTimes } from 'src/app/charts/price-times';

export interface TokenInfo {
  pairInfo: {
    swapIcon: string;
    chainIcon: string;
    token0Name: string;
    token1Name: string;
    pairAddress: string;
  };
  listedSince: string;
  tokenPriceUSD: string;
  initialLiquidity: string;
  totalLiquidity: string;
  poolAmount: string;
  poolVariation: number;
  poolRemaining: string;
  contract: string;
  actions: string[];
}

export interface SelectedPair {
  name: string;
  price: number;
  growthPercentage: number;
  previousPrices: number[];
  previousTimes: number[];
}

@Component({
  selector: 'live-pair',
  templateUrl: './live-pairs.component.html',
  styleUrls: ['./live-pairs.component.css'],
})
export class LivePairsComponent implements OnInit, AfterViewInit, OnDestroy {
  pairList: TokenInfo[] = [];
  dataSource = new MatTableDataSource<TokenInfo>([]);
  dataLoaded = false;
  selectedPair: SelectedPair | null = null;

  pageSize = 15;
  pageSizeOptions = [5, 10, 15, 25, 50, 100];

  private pollSub?: Subscription;
  private chainSub?: Subscription;
  // cada 30 minutos lanza las requests
  private readonly POLL_INTERVAL = 30000;

  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta: ChainMeta;

  constructor(
    private api: ApiService,
    private chainService: ChainService
  ) {
    this.activeChain = this.chainService.getActiveChain();
    this.activeChainMeta = this.chainService.getChainMeta(this.activeChain);
  }

  displayedColumns = [
    'pairInfo', 'listedSince', 'tokenPriceUSD', 'initialLiquidity',
    'totalLiquidity', 'poolAmount', 'poolVariation', 'poolRemaining',
    'contract', 'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: TokenInfo, filter: string) => {
      const s = filter.toLowerCase();
      return data.pairInfo.token0Name.toLowerCase().includes(s) ||
        data.pairInfo.token1Name.toLowerCase().includes(s) ||
        data.pairInfo.pairAddress.toLowerCase().includes(s) ||
        data.tokenPriceUSD.toLowerCase().includes(s);
    };

    this.fetchData();
    this.pollSub = interval(this.POLL_INTERVAL).subscribe(() => {
      this.fetchData();
    });

    this.chainSub = this.chainService.chain$.subscribe((chain) => {
      this.activeChain = chain;
      this.activeChainMeta = this.chainService.getChainMeta(chain);
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.chainSub?.unsubscribe();
  }

  private fetchData() {
    this.api.getLivePairs(this.activeChain).subscribe({
      next: (data: LivePair[]) => {
        this.pairList = data.map((item) => ({
          pairInfo: {
            swapIcon: this.activeChainMeta.dexIcon,
            chainIcon: this.activeChainMeta.icon,
            token0Name: item.token0Name,
            token1Name: item.token1Name,
            pairAddress: item.pairAddress,
          },
          listedSince: item.listedSince,
          tokenPriceUSD: `$${item.tokenPriceUSD}`,
          initialLiquidity: item.initialLiquidity,
          totalLiquidity: item.totalLiquidity,
          poolAmount: item.poolAmount,
          poolVariation: item.poolVariation,
          poolRemaining: item.poolRemaining,
          contract: item.contract,
          actions: [],
        }));
        this.dataSource.data = this.pairList;
        this.dataLoaded = true;
        this.applySortAndPaginator();
      },
      error: () => {
        this.dataLoaded = true;
        this.dataSource.data = [];
        this.applySortAndPaginator();
      },
    });
  }

  ngAfterViewInit() {
    this.applySortAndPaginator();
  }

  search(event: any) {
    const value = event.target.value.trim().toLowerCase();
    this.dataSource.filter = value;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  selectPair(element: TokenInfo) {
    const price = parseFloat(element.tokenPriceUSD.replace(/[$,]/g, '')) || 0;
    const prices = this.generatePrices(price);
    this.selectedPair = {
      name: `${element.pairInfo.token0Name} / ${element.pairInfo.token1Name}`,
      price,
      growthPercentage: element.poolVariation,
      previousPrices: prices,
      previousTimes: generateTimes(prices.length),
    };
  }

  private generatePrices(price: number): number[] {
    const base = price > 0 ? price : 1;
    const prices: number[] = [];
    let v = base * 0.92;
    for (let i = 0; i < 36; i++) {
      v = v * (1 + (Math.random() - 0.48) * 0.03);
      prices.push(parseFloat(v.toFixed(8)));
    }
    prices.push(base);
    return prices;
  }

  get currentPage(): number {
    return this.dataSource.paginator ? this.dataSource.paginator.pageIndex + 1 : 1;
  }

  get totalPages(): number {
    const p = this.dataSource.paginator;
    if (!p || p.length === 0) return 1;
    return Math.max(1, Math.ceil(p.length / p.pageSize));
  }

  canPrevPage(): boolean {
    return this.dataSource.paginator ? (this.dataSource.paginator as MatPaginator).hasPreviousPage() : false;
  }

  canNextPage(): boolean {
    return this.dataSource.paginator ? (this.dataSource.paginator as MatPaginator).hasNextPage() : false;
  }

  setPageSize(size: number) {
    this.pageSize = size;
    if (this.dataSource.paginator) {
      (this.dataSource.paginator as MatPaginator)._changePageSize(size);
    }
  }

  firstPage() {
    this.dataSource.paginator?.firstPage();
  }

  prevPage() {
    (this.dataSource.paginator as MatPaginator)?.previousPage();
  }

  nextPage() {
    (this.dataSource.paginator as MatPaginator)?.nextPage();
  }

  lastPage() {
    this.dataSource.paginator?.lastPage();
  }

  private applySortAndPaginator() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  generateAvatarInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
    return initials;
  }

  getTokenIcon(name: string): string {
    return getTokenIcon(name);
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }
}
