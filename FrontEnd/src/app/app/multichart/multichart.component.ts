import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { HotPair, LivePair } from 'src/app/Interface/api.interfaces';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';
import { getTokenIcon } from 'src/app/Service/token-icons';
import { generateTimes } from 'src/app/charts/price-times';

export interface PairOption {
  id: string;
  name: string;
  token0: string;
  token1: string;
  price: number;
  growthPercentage: number;
  prices: number[];
  times: number[];
  tokenIcon: string;
  metric: number | null;
  metricLabel: string;
}

export interface ChartCard extends PairOption {}

@Component({
  selector: 'app-multichart',
  templateUrl: './multichart.component.html',
  styleUrls: ['./multichart.component.css'],
})
export class MultiChartComponent implements OnInit, OnDestroy {
  Math = Math;
  cards: ChartCard[] = [];
  pool: PairOption[] = [];
  query = '';
  filteredOptions: PairOption[] = [];
  dataLoaded = false;
  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta = this.chainService.getChainMeta(this.activeChain);

  private chainSub?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private chainService: ChainService
  ) {}

  ngOnInit(): void {
    this.activeChain = this.chainService.getActiveChain();
    this.activeChainMeta = this.chainService.getChainMeta(this.activeChain);
    this.restore();
    this.fetchData();

    this.chainSub = this.chainService.chain$.subscribe((chain) => {
      this.activeChain = chain;
      this.activeChainMeta = this.chainService.getChainMeta(chain);
      this.query = '';
      this.filteredOptions = [];
      this.restore();
      this.fetchData();
    });
  }

  ngOnDestroy(): void {
    this.chainSub?.unsubscribe();
  }

  get pickerLocked(): boolean {
    return this.cards.length >= 2;
  }

  private storageKey(): string {
    return `wooftools.multichart.cards.${this.activeChain}`;
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.cards));
    } catch {
      // ignore quota / private mode errors
    }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) {
        this.cards = [];
        return;
      }
      const arr = JSON.parse(raw);
      this.cards = Array.isArray(arr)
        ? arr.filter((c) => c && c.id && c.name && c.token0).slice(0, 2)
        : [];
    } catch {
      this.cards = [];
    }
  }

  private fetchData() {
    forkJoin({
      live: this.api.getLivePairs(this.activeChain),
      hot: this.api.getHotPairs(this.activeChain),
    }).subscribe({
      next: ({ live, hot }) => {
        const options: PairOption[] = [];

        live.forEach((item: LivePair) => {
          const prices = this.generatePrices(item.tokenPriceUSD);
          options.push({
            id: `live-${item.id}`,
            name: `${item.token0Name} / ${item.token1Name}`,
            token0: item.token0Name,
            token1: item.token1Name,
            price: item.tokenPriceUSD,
            growthPercentage: item.poolVariation,
            prices,
            times: generateTimes(prices.length),
            tokenIcon: getTokenIcon(item.token0Name.trim()),
            metric: item.poolVariation,
            metricLabel: 'Pool var.',
          });
        });

        hot.forEach((item: HotPair) => {
          const prices =
            item.previousPrices && item.previousPrices.length > 1
              ? item.previousPrices.slice(-this.RECENT_POINTS)
              : this.generatePrices(item.price ?? 0);
          const times =
            item.previousTimes && item.previousTimes.length === prices.length
              ? item.previousTimes.slice(-this.RECENT_POINTS)
              : generateTimes(prices.length);
          const [token0, token1] = this.splitPairName(item.pairName);
          options.push({
            id: `hot-${item.id}`,
            name: item.pairName,
            token0,
            token1,
            price: item.price ?? 0,
            growthPercentage: item.growthPercentage ?? 0,
            prices,
            times: times.length === prices.length ? times : generateTimes(prices.length),
            tokenIcon: getTokenIcon(token0),
            metric: item.popularity ?? 0,
            metricLabel: 'Popularity',
          });
        });

        this.pool = this.dedupeByName(options);
        this.dataLoaded = true;
        this.revalidateCards();
        this.applyQueryFilter();
        this.addRequested();
      },
      error: () => {
        this.dataLoaded = true;
        this.pool = [];
        this.filteredOptions = [];
      },
    });
  }

  private revalidateCards(): void {
    this.restore();
    if (this.cards.length === 0) return;
    const byId = new Map(this.pool.map((o) => [o.id, o]));
    const kept = this.cards
      .map((c) => byId.get(c.id))
      .filter((o): o is PairOption => !!o)
      .slice(0, 2);
    this.cards = kept.map((o) => ({ ...o }));
    this.persist();
  }

  private addRequested(): void {
    const params = this.route.snapshot.queryParams;
    const addId = params['add'] as string | undefined;
    if (!addId) return;
    const network = params['network'] as string | undefined;
    if (network && network !== this.activeChain) {
      this.chainService.selectChain(network);
      return;
    }
    const option = this.pool.find((o) => o.id === addId);
    if (option) {
      this.addCard(option);
      this.router.navigate([], {
        queryParams: { add: null, network: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  private readonly RECENT_POINTS = 30;

  private splitPairName(name: string): [string, string] {
    const parts = name.split('/');
    return [parts[0]?.trim() ?? '', parts[1]?.trim() ?? ''];
  }

  private dedupeByName(options: PairOption[]): PairOption[] {
    const seen = new Set<string>();
    const out: PairOption[] = [];
    options.forEach((o) => {
      const key = o.name.toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(o);
      }
    });
    return out;
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

  onQuery(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.applyQueryFilter();
  }

  private applyQueryFilter(): void {
    const q = this.query.trim().toLowerCase();
    this.filteredOptions = q
      ? this.pool.filter((o) =>
          o.name.toLowerCase().includes(q) ||
          o.token0.toLowerCase().includes(q) ||
          o.token1.toLowerCase().includes(q)
        )
      : [];
  }

  addCard(option: PairOption): void {
    if (this.cards.length >= 2) return;
    if (this.cards.some((c) => c.id === option.id)) return;
    this.cards = [...this.cards, { ...option }];
    this.query = '';
    this.filteredOptions = [];
    this.persist();
  }

  removeCard(id: string): void {
    this.cards = this.cards.filter((c) => c.id !== id);
    this.persist();
  }

  clearCards(): void {
    this.cards = [];
    this.persist();
  }

  swapToken(card: ChartCard, tokenSymbol: string): void {
    this.router.navigate(['/multiswap'], {
      queryParams: { network: this.activeChain, token: tokenSymbol },
    });
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }
}
