import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/Service/api.service';
import { DashboardData, HotPair } from 'src/app/Interface/api.interfaces';

export interface TokenInfo {
  pairInfo: {
    swapIcon: string;
    chainIcon: string;
    token0Name: string;
    token1Name: string;
    pairAddress: string;
  };
  price: string;
  percentage24H: number;
  score: number;
  contracts: string;
  created: string;
  volume: string;
  swaps: string;
  liquidity: string;
  TMCap: string;
  Dex: string[];
  actions: string[];
}

export interface RankingItem {
  rank: number;
  name: string;
  price: string;
  percentage: number;
  isPositive: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  tokensList: TokenInfo[] = [];
  filteredPairs: any[] = [];
  dataSource: MatTableDataSource<TokenInfo> = new MatTableDataSource<TokenInfo>([]);
  dataLoaded = false;

  rankings: RankingItem[] = [];
  hotPairsList: HotPair[] = [];

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  displayedColumns = [
    'pairInfo', 'price', 'percentage24H', 'score',
    'contracts', 'created', 'volume', 'swaps',
    'liquidity', 'TMCap', 'Dex', 'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  search(event: any) {
    const value = event.target.value.trim().toLowerCase();
    this.dataSource.filter = value;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit(): void {
    this.api.getDashboardData().subscribe({
      next: (data: DashboardData[]) => {
        const sorted = [...data].sort((a, b) => b.score - a.score);
        this.rankings = sorted.slice(0, 10).map((item, i) => ({
          rank: i + 1,
          name: item.token0Name,
          price: `$${item.price}`,
          percentage: item.percentage24H,
          isPositive: item.percentage24H >= 0,
        }));

        this.tokensList = data.map((item) => ({
          pairInfo: {
            swapIcon: '',
            chainIcon: '',
            token0Name: item.token0Name,
            token1Name: item.token1Name,
            pairAddress: item.pairAddress,
          },
          price: `$${item.price}`,
          percentage24H: item.percentage24H,
          score: item.score,
          contracts: item.contracts,
          created: item.created,
          volume: item.volume,
          swaps: item.swaps,
          liquidity: item.liquidity,
          TMCap: item.marketCap,
          Dex: item.dex,
          actions: [],
        }));
        this.filteredPairs = this.tokensList;
        this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs);
        this.dataSource.filterPredicate = (data: TokenInfo, filter: string) => {
          const searchStr = filter.toLowerCase();
          return data.pairInfo.token0Name.toLowerCase().includes(searchStr) ||
            data.pairInfo.token1Name.toLowerCase().includes(searchStr) ||
            data.pairInfo.pairAddress.toLowerCase().includes(searchStr) ||
            data.price.toLowerCase().includes(searchStr);
        };
        this.dataLoaded = true;
        setTimeout(() => this.applySortAndPaginator(), 0);
      },
      error: () => {
        this.dataLoaded = true;
        this.dataSource = new MatTableDataSource<TokenInfo>([]);
        setTimeout(() => this.applySortAndPaginator(), 0);
      },
    });

    this.api.getHotPairs().subscribe({
      next: (data: HotPair[]) => {
        this.hotPairsList = data;
      },
      error: () => {
        this.hotPairsList = [];
      },
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.applySortAndPaginator(), 0);
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
