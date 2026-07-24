import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, interval } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { LivePair } from 'src/app/Interface/api.interfaces';

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

@Component({
  selector: 'live-pair',
  templateUrl: './live-pairs.component.html',
  styleUrls: ['./live-pairs.component.css'],
})
export class LivePairsComponent implements OnInit, AfterViewInit, OnDestroy {
  pairList: TokenInfo[] = [];
  dataSource = new MatTableDataSource<TokenInfo>([]);
  dataLoaded = false;

  private pollSub?: Subscription;
  private readonly POLL_INTERVAL = 60000;

  constructor(
    private api: ApiService
  ) {}

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
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private fetchData() {
    this.api.getLivePairs().subscribe({
      next: (data: LivePair[]) => {
        this.pairList = data.map((item) => ({
          pairInfo: {
            swapIcon: '',
            chainIcon: '',
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

  private applySortAndPaginator() {
    if (this.dataSource && this.sort && this.paginator) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  generateAvatarInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase();
    return initials;
  }
}
