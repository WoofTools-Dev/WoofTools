import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { DashboardData, HotPair, DailyWinner, DailyLoser } from 'src/app/Interface/api.interfaces';

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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  tokensList: TokenInfo[] = [];
  filteredPairs: any[] = [];
  dataSource: any = null;

  hotPairs: HotPair[] = [];
  dailyWinners: DailyWinner[] = [];
  dailyLosers: DailyLoser[] = [];

  private pollingSub!: Subscription;

  constructor(
    private router: Router,
    private api: ApiService
  ) {
    this.filteredPairs = this.tokensList;
  }

  displayedColumns = [
    'pairInfo', 'price', 'percentage24H', 'score',
    'contracts', 'created', 'volume', 'swaps',
    'liquidity', 'TMCap', 'Dex', 'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  search(event: any) {
    let value = event.target.value;
    this.filteredPairs = this.tokensList.filter((item: any) => {
      return (
        item.pairInfo.token0Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.token1Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.pairAddress.toLowerCase().includes(value.toLowerCase()) ||
        item.price.toLowerCase().includes(value.toLowerCase())
      );
    });
    this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs);
  }

  ngOnInit(): void {
    this.pollingSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.api.getDashboardData())
    ).subscribe({
      next: (data: DashboardData[]) => {
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
        if (this.sort && this.paginator) {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.dataSource = new MatTableDataSource<TokenInfo>([]);
      },
    });

    this.api.getHotPairs().subscribe(data => this.hotPairs = data);
    this.api.getDailyWinners().subscribe(data => this.dailyWinners = data);
    this.api.getDailyLosers().subscribe(data => this.dailyLosers = data);
  }

  ngAfterViewInit() {
    if (this.dataSource && this.sort && this.paginator) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
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

