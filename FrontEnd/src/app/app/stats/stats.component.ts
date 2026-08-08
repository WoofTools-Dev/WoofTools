import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';
import { DashboardData, SwapTransaction, HotPair } from 'src/app/Interface/api.interfaces';

export interface StatCard {
  label: string;
  value: string;
  accent: string;
}

export interface TopPairRow {
  rank: number;
  name: string;
  price: string;
  change: number;
}

export interface TopMakerRow {
  rank: number;
  address: string;
  volume: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent implements OnInit, OnDestroy {
  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta = this.chainService.getActiveChainMeta();
  dataLoaded = false;

  cards: StatCard[] = [];
  topGainers: TopPairRow[] = [];
  topMakers: TopMakerRow[] = [];

  private chainSub?: Subscription;

  constructor(
    private api: ApiService,
    private chainService: ChainService
  ) {}

  ngOnInit(): void {
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
    forkJoin({
      dashboard: this.api.getDashboardData(this.activeChain),
      swaps: this.api.getSwaps(this.activeChain),
      hotPairs: this.api.getHotPairs(this.activeChain),
    }).subscribe({
      next: ({ dashboard, swaps, hotPairs }) => {
        this.buildStats(dashboard, swaps, hotPairs);
        this.dataLoaded = true;
      },
      error: () => {
        this.cards = [];
        this.topGainers = [];
        this.topMakers = [];
        this.dataLoaded = true;
      },
    });
  }

  private buildStats(dashboard: DashboardData[], swaps: SwapTransaction[], hotPairs: HotPair[]) {
    const volume = dashboard.reduce((sum, item) => sum + this.parseVolume(item.volume), 0);
    const totalSwaps = dashboard.reduce((sum, item) => sum + this.parseCount(item.swaps), 0);
    const avgChange = dashboard.length
      ? dashboard.reduce((sum, item) => sum + item.percentage24H, 0) / dashboard.length
      : 0;

    const dexCount: Record<string, number> = {};
    dashboard.forEach((item) => {
      item.dex?.forEach((d) => {
        dexCount[d] = (dexCount[d] || 0) + 1;
      });
    });
    const topDex = Object.entries(dexCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? this.activeChainMeta.dex;

    const makers: Record<string, number> = {};
    swaps.forEach((s) => {
      makers[s.maker] = (makers[s.maker] || 0) + s.totalUSD;
    });
    this.topMakers = Object.entries(makers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([address, vol], i) => ({
        rank: i + 1,
        address,
        volume: `$${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      }));

    const gainers = dashboard
      .filter((d) => d.percentage24H > 0)
      .sort((a, b) => b.percentage24H - a.percentage24H)
      .slice(0, 5);
    this.topGainers = gainers.map((d, i) => ({
      rank: i + 1,
      name: `${d.token0Name} / ${d.token1Name}`,
      price: `$${d.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}`,
      change: d.percentage24H,
    }));
    if (this.topGainers.length === 0 && hotPairs.length > 0) {
      this.topGainers = hotPairs.slice(0, 5).map((h, i) => ({
        rank: i + 1,
        name: h.pairName,
        price: h.price ? `$${h.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}` : '—',
        change: h.growthPercentage ?? 0,
      }));
    }

    this.cards = [
      {
        label: 'Total Pairs',
        value: dashboard.length.toLocaleString(),
        accent: 'var(--primary)',
      },
      {
        label: 'Total Volume (24H)',
        value: `$${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        accent: '#22c55e',
      },
      {
        label: 'Total Swaps',
        value: totalSwaps.toLocaleString(),
        accent: '#38bdf8',
      },
      {
        label: 'Avg Change (24H)',
        value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
        accent: avgChange >= 0 ? '#22c55e' : '#ef4444',
      },
      {
        label: 'Top Dex',
        value: topDex,
        accent: '#fbbf24',
      },
      {
        label: 'Gas Symbol',
        value: this.activeChainMeta.gasSymbol,
        accent: '#a78bfa',
      },
    ];
  }

  private parseVolume(v: string): number {
    const clean = v.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    if (/k|K/.test(v)) return num * 1000;
    if (/m|M/.test(v)) return num * 1000000;
    if (/b|B/.test(v)) return num * 1000000000;
    return num;
  }

  private parseCount(v: string): number {
    const clean = v.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }
}
