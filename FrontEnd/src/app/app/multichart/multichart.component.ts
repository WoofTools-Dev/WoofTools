import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { HotPair } from 'src/app/Interface/api.interfaces';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';
import { getTokenIcon } from 'src/app/Service/token-icons';
import { generateTimes } from 'src/app/charts/price-times';

export interface ChartCard {
  pairName: string;
  growthPercentage: number;
  popularity: number;
  prices: number[];
  times: number[];
  tokenIcon: string;
}

@Component({
  selector: 'app-multichart',
  templateUrl: './multichart.component.html',
  styleUrls: ['./multichart.component.css'],
})
export class MultiChartComponent implements OnInit, OnDestroy {
  Math = Math;
  cards: ChartCard[] = [];
  dataLoaded = false;
  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta = this.chainService.getActiveChainMeta();

  private readonly RECENT_POINTS = 30;
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
    this.api.getHotPairs(this.activeChain).subscribe({
      next: (data: HotPair[]) => {
        this.cards = data.map((item) => {
          const prices = item.previousPrices && item.previousPrices.length > 1
            ? item.previousPrices.slice(-this.RECENT_POINTS)
            : [1, 1.02, 1.01, 1.05, 1.03, 1.09];
          const times = item.previousTimes && item.previousTimes.length > 1
            ? item.previousTimes.slice(-this.RECENT_POINTS)
            : generateTimes(prices.length);
          return {
            pairName: item.pairName,
            growthPercentage: item.growthPercentage ?? 0,
            popularity: item.popularity,
            prices,
            times: times.length === prices.length ? times : generateTimes(prices.length),
            tokenIcon: getTokenIcon(item.pairName.split('/')[0].trim()),
          };
        });
        this.dataLoaded = true;
      },
      error: () => {
        this.dataLoaded = true;
        this.cards = [];
      },
    });
  }

  handleImgError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/coins/ETH.png';
  }
}
