import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Subscription } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import {
  DashboardData,
  HotPair,
  DailyWinner,
  DailyLoser,
  UpdatedRRSS,
} from 'src/app/Interface/api.interfaces';
import { getTokenIcon } from 'src/app/Service/token-icons';
import { SearchService } from 'src/app/Service/search.service';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainMeta } from 'src/app/Service/chain.constants';
import { generateTimes } from 'src/app/charts/price-times';
import { WalletService } from 'src/app/provider/walletprovider';

export interface TokenInfo {
  pairInfo: {
    swapIcon: string;
    chainIcon: string;
    token0Name: string;
    token1Name: string;
    pairAddress: string;
  };
  id: number;
  price: string;
  percentage24H: number;
  score: number;
  likedByMe: boolean;
  myLikes: number;
  remainingLikes: number;
  contracts: string;
  created: string;
  volume: string;
  swaps: string;
  liquidity: string;
  TMCap: string;
  Dex: string[];
  actions: string[];
}

export interface RankRow {
  rank: number;
  name: string;
  price: number;
  percentage: number;
  isPositive: boolean;
  previousPrices: number[];
  previousTimes: number[];
}

export interface ChartSelectable {
  name: string;
  price: number;
  growthPercentage: number;
  previousPrices: number[];
  previousTimes: number[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  tokensList: TokenInfo[] = [];
  dataSource = new MatTableDataSource<TokenInfo>([]);
  dataLoaded = false;

  winners: RankRow[] = [];
  losers: RankRow[] = [];
  updatedRows: RankRow[] = [];
  hotPairsList: HotPair[] = [];
  filteredWinners: RankRow[] = [];
  filteredLosers: RankRow[] = [];
  filteredUpdated: RankRow[] = [];
  filteredHotPairs: HotPair[] = [];
  selectedPair: ChartSelectable | null = null;
  searchQuery = '';
  likeError: string | null = null;

  activeChainMeta: ChainMeta;
  private chainSub: Subscription | null = null;
  private searchSub: Subscription | null = null;

  constructor(
    private router: Router,
    private api: ApiService,
    private searchService: SearchService,
    private chainService: ChainService,
    private wallet: WalletService
  ) {
    this.activeChainMeta = this.chainService.getActiveChainMeta();
  }

  displayedColumns = [
    'pairInfo', 'price', 'percentage24H', 'score',
    'contracts', 'created', 'volume', 'swaps',
    'liquidity', 'TMCap', 'Dex', 'actions',
  ];

  rankingColumns = ['rank', 'name', 'price', 'change'];
  hotPairColumns = ['rank', 'name', 'price', 'change', 'likes'];

  pageSize = 15;
  pageSizeOptions = [5, 10, 15, 25, 50, 100];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: TokenInfo, filter: string) => {
      const s = filter.toLowerCase();
      return data.pairInfo.token0Name.toLowerCase().includes(s) ||
        data.pairInfo.token1Name.toLowerCase().includes(s) ||
        data.pairInfo.pairAddress.toLowerCase().includes(s) ||
        data.price.toLowerCase().includes(s);
    };

    this.chainSub = this.chainService.chain$.subscribe((chain) => {
      this.activeChainMeta = this.chainService.getActiveChainMeta();
      this.loadData(chain);
    });

    this.searchSub = this.searchService.query$.subscribe(q => {
      if (q !== undefined) {
        this.searchQuery = q.trim().toLowerCase();
        this.applySearchFilter();
      }
    });
  }

  private loadData(chain: string) {
    const wallet = this.wallet.address || undefined;
    forkJoin({
      dashboard: this.api.getDashboardData(chain, wallet),
      hotPairs: this.api.getHotPairs(chain, wallet),
      winners: this.api.getDailyWinners(chain),
      losers: this.api.getDailyLosers(chain),
      updated: this.api.getUpdatedRRSS(chain),
    }).subscribe({
      next: ({ dashboard, hotPairs, winners, losers, updated }) => {
        this.buildMainTable(dashboard);

        this.winners = winners.map((w, i) => this.toRankRow(w.username, w.price, w.growthPercentage, w.previousPrices, w.previousTimes, i));
        this.losers = losers.map((l, i) => this.toRankRow(l.username, l.price, l.growthPercentage, l.previousPrices, l.previousTimes, i));
        this.updatedRows = updated.map((u, i) => this.toRankRow(u.profileName, u.price, u.growthPercentage, u.previousPrices, u.previousTimes, i));
        this.hotPairsList = hotPairs;

        this.dataLoaded = true;
        this.applySortAndPaginator();
        this.applySearchFilter();

        if (!this.selectedPair) {
          if (hotPairs.length > 0) {
            this.selectHotPair(hotPairs[0]);
          } else if (this.winners.length > 0) {
            this.selectRow(this.winners[0]);
          }
        }
      },
      error: () => {
        this.dataLoaded = true;
        this.dataSource.data = [];
        this.winners = [];
        this.losers = [];
        this.updatedRows = [];
        this.hotPairsList = [];
        this.applySortAndPaginator();
        this.applySearchFilter();
      },
    });
  }

  private buildMainTable(data: DashboardData[]) {
    this.tokensList = data.map((item) => ({
      pairInfo: {
        swapIcon: this.activeChainMeta.dexIcon,
        chainIcon: this.activeChainMeta.icon,
        token0Name: item.token0Name,
        token1Name: item.token1Name,
        pairAddress: item.pairAddress,
      },
      id: item.id,
      price: `$${item.price}`,
      percentage24H: item.percentage24H,
      score: item.score,
      likedByMe: item.likedByMe ?? false,
      myLikes: item.myCount ?? 0,
      remainingLikes: item.remainingLikes ?? 20,
      contracts: item.contracts,
      created: item.created,
      volume: item.volume,
      swaps: item.swaps,
      liquidity: item.liquidity,
      TMCap: item.marketCap,
      Dex: item.dex,
      actions: [],
    }));
    this.dataSource.data = this.tokensList;
  }

  get walletAddress(): string {
    return this.wallet.address;
  }

  isWalletConnected(): boolean {
    return this.wallet.isWalletConnected();
  }

  async connectWallet(): Promise<void> {
    await this.wallet.connectWallet();
    if (this.wallet.isWalletConnected()) {
      await this.loadData(this.chainService.getActiveChain());
    }
  }

  private showLikeError(message: string): void {
    this.likeError = message;
    setTimeout(() => {
      if (this.likeError === message) this.likeError = null;
    }, 4000);
  }

  async likeDashboard(element: TokenInfo) {
    if (!this.isWalletConnected()) {
      await this.connectWallet();
      if (!this.isWalletConnected()) {
        this.showLikeError('Conecta tu wallet para dar like');
        return;
      }
    }
    if (element.remainingLikes <= 0) return;
    this.api.addLike('dashboard', element.id, this.wallet.address).subscribe({
      next: (res) => {
        element.score = res.count;
        element.likedByMe = res.likedByMe;
        element.myLikes = res.myCount;
        element.remainingLikes = res.remaining;
      },
      error: () => {
        this.showLikeError('No se pudo registrar el like. Revisa que el backend esté activo.');
      },
    });
  }

  async likeHotPair(pair: HotPair) {
    if (!this.isWalletConnected()) {
      await this.connectWallet();
      if (!this.isWalletConnected()) {
        this.showLikeError('Conecta tu wallet para dar like');
        return;
      }
    }
    if (pair.remainingLikes !== undefined && pair.remainingLikes <= 0) return;
    this.api.addLike('hotpair', pair.id, this.wallet.address).subscribe({
      next: (res) => {
        pair.popularity = res.count;
        pair.likedByMe = res.likedByMe;
        pair.myCount = res.myCount;
        pair.remainingLikes = res.remaining;
      },
      error: () => {
        this.showLikeError('No se pudo registrar el like. Revisa que el backend esté activo.');
      },
    });
  }

  private toRankRow(name: string, price: number | undefined, growth: number | undefined, previousPrices: number[], previousTimes: number[] | undefined, index: number): RankRow {
    const safePrice = price ?? 0;
    const safeGrowth = growth ?? 0;
    const prices = previousPrices && previousPrices.length >= 2
      ? previousPrices
      : this.generatePrices(safePrice);
    return {
      rank: index + 1,
      name: name || '—',
      price: safePrice,
      percentage: safeGrowth,
      isPositive: safeGrowth >= 0,
      previousPrices: prices,
      previousTimes: previousTimes && previousTimes.length === prices.length
        ? previousTimes
        : generateTimes(prices.length),
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

  private generatePricesWithTimes(price: number): { prices: number[]; times: number[] } {
    const prices = this.generatePrices(price);
    return { prices, times: generateTimes(prices.length) };
  }

  ngOnDestroy(): void {
    this.chainSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  selectRow(row: RankRow) {
    this.selectedPair = {
      name: row.name,
      price: row.price,
      growthPercentage: row.percentage,
      previousPrices: row.previousPrices,
      previousTimes: row.previousTimes,
    };
  }

  selectMainRow(element: TokenInfo) {
    const price = parseFloat(element.price.replace(/[$,]/g, '')) || 0;
    const { prices, times } = this.generatePricesWithTimes(price);
    this.selectedPair = {
      name: `${element.pairInfo.token0Name} / ${element.pairInfo.token1Name}`,
      price,
      growthPercentage: element.percentage24H,
      previousPrices: prices,
      previousTimes: times,
    };
  }

  selectHotPair(pair: HotPair) {
    const prices = pair.previousPrices && pair.previousPrices.length >= 2
      ? pair.previousPrices
      : this.generatePrices(pair.price ?? 0);
    this.selectedPair = {
      name: pair.pairName,
      price: pair.price ?? 0,
      growthPercentage: pair.growthPercentage ?? 0,
      previousPrices: prices,
      previousTimes: pair.previousTimes && pair.previousTimes.length === prices.length
        ? pair.previousTimes
        : generateTimes(prices.length),
    };
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

  private matches(query: string, value: string): boolean {
    return value.toLowerCase().includes(query);
  }

  private applySearchFilter() {
    this.dataSource.filter = this.searchQuery;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    const q = this.searchQuery;
    this.filteredWinners = q
      ? this.winners.filter(r => this.matches(q, r.name))
      : [...this.winners];
    this.filteredLosers = q
      ? this.losers.filter(r => this.matches(q, r.name))
      : [...this.losers];
    this.filteredUpdated = q
      ? this.updatedRows.filter(r => this.matches(q, r.name))
      : [...this.updatedRows];
    this.filteredHotPairs = q
      ? this.hotPairsList.filter(p => this.matches(q, p.pairName))
      : [...this.hotPairsList];
  }

  getTokenIcon(name: string): string {
    return getTokenIcon(name);
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }

  getTimeElapsed(dateTime: string): string {
    const currentDate = new Date();
    const inputDate = new Date(dateTime);
    const timeDifference = currentDate.getTime() - inputDate.getTime();
    const hoursElapsed = Math.floor(timeDifference / (1000 * 60 * 60));
    const daysElapsed = Math.floor(hoursElapsed / 24);
    const yearsElapsed = Math.floor(daysElapsed / 365);

    if (yearsElapsed > 0) {
      return `${yearsElapsed} ${yearsElapsed === 1 ? 'year' : 'years'}`;
    } else if (daysElapsed > 0) {
      return `${daysElapsed} ${daysElapsed === 1 ? 'day' : 'days'}`;
    } else {
      return `${hoursElapsed} ${hoursElapsed === 1 ? 'hour' : 'hours'}`;
    }
  }
}
