import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { LivePair } from 'src/app/Interface/api.interfaces';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';
import { getTokenIcon } from 'src/app/Service/token-icons';
import { generateTimes } from 'src/app/charts/price-times';

export interface PairInfo {
  id: number;
  token0Name: string;
  token1Name: string;
  pairAddress: string;
  dexIcon: string;
  chainIcon: string;
  chainName: string;
  chainKey: ChainKey;
  price: number;
  growthPercentage: number;
}

export interface SelectedPair {
  name: string;
  price: number;
  growthPercentage: number;
  previousPrices: number[];
  previousTimes: number[];
}

@Component({
  selector: 'app-pair-explorer',
  templateUrl: './pair-explorer.component.html',
  styleUrls: ['./pair-explorer.component.css'],
})
export class PairExplorerComponent implements OnInit, AfterViewInit, OnDestroy {
  pairs: PairInfo[] = [];
  dataSource = new MatTableDataSource<PairInfo>([]);
  dataLoaded = false;
  selectedPair: SelectedPair | null = null;

  pageSize = 15;
  pageSizeOptions = [5, 10, 15, 25, 50, 100];

  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta = this.chainService.getActiveChainMeta();

  displayedColumns = ['pairInfo', 'dex', 'chain', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private chainSub?: Subscription;

  constructor(
    private api: ApiService,
    private chainService: ChainService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: PairInfo, filter: string) => {
      const s = filter.toLowerCase();
      return data.token0Name.toLowerCase().includes(s) ||
        data.token1Name.toLowerCase().includes(s) ||
        data.pairAddress.toLowerCase().includes(s);
    };

    this.activeChain = this.chainService.getActiveChain();
    this.activeChainMeta = this.chainService.getChainMeta(this.activeChain);
    this.fetchData();

    this.chainSub = this.chainService.chain$.subscribe((chain) => {
      this.activeChain = chain;
      this.activeChainMeta = this.chainService.getChainMeta(chain);
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.chainSub?.unsubscribe();
  }

  private fetchData() {
    this.api.getLivePairs(this.activeChain).subscribe({
      next: (data: LivePair[]) => {
        this.pairs = data.map((item) => ({
          id: item.id,
          token0Name: item.token0Name,
          token1Name: item.token1Name,
          pairAddress: item.pairAddress,
          dexIcon: this.activeChainMeta.dexIcon,
          chainIcon: this.activeChainMeta.icon,
          chainName: this.activeChainMeta.name,
          chainKey: this.activeChain,
          price: item.tokenPriceUSD,
          growthPercentage: item.poolVariation,
        }));
        this.dataSource.data = this.pairs;
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

  selectPair(element: PairInfo) {
    const prices = this.generatePrices(element.price);
    this.selectedPair = {
      name: `${element.token0Name} / ${element.token1Name}`,
      price: element.price,
      growthPercentage: element.growthPercentage,
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

  getTokenIcon(name: string): string {
    return getTokenIcon(name);
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }

  buildExplorerUrl(pair: PairInfo): string {
    return `${this.activeChainMeta.explorerUrl}/address/${pair.pairAddress}`;
  }

  addToMultiChart(pair: PairInfo): void {
    this.router.navigate(['/multichart'], {
      queryParams: { network: pair.chainKey, add: `live-${pair.id}` },
    });
  }
}
