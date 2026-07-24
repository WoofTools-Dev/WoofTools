import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/Service/api.service';
import { SwapTransaction } from 'src/app/Interface/api.interfaces';
import { getTokenIcon } from 'src/app/Service/token-icons';

export interface TokenInfo {
  pairInfo: {
    swapIcon: string;
    chainIcon: string;
    token0Name: string;
    token1Name: string;
    pairAddress: string;
  };
  executionTime: string;
  type: "SELL" | "BUY";
  quantity: string;
  totalETH: string;
  totalUSD: string;
  variation: number;
  maker: string;
  actions: string[];
}

@Component({
  selector: 'app-big-swap-explorer',
  templateUrl: './big-swap-explorer.component.html',
  styleUrls: ['./big-swap-explorer.component.css']
})
export class BigSwapExplorerComponent implements OnInit, AfterViewInit {
  pairList: TokenInfo[] = [];
  dataSource = new MatTableDataSource<TokenInfo>([]);
  dataLoaded = false;

  constructor(
    private api: ApiService
  ) {}

  displayedColumns = [
    'pairInfo', 'executionTime', 'type', 'quantity',
    'totalETH', 'totalUSD', 'variation', 'maker', 'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: TokenInfo, filter: string) => {
      const s = filter.toLowerCase();
      return data.pairInfo.token0Name.toLowerCase().includes(s) ||
        data.pairInfo.token1Name.toLowerCase().includes(s) ||
        data.pairInfo.pairAddress.toLowerCase().includes(s);
    };

    this.api.getSwaps().subscribe({
      next: (data: SwapTransaction[]) => {
        this.pairList = data.map((item) => ({
          pairInfo: {
            swapIcon: '',
            chainIcon: '',
            token0Name: item.token0Name,
            token1Name: item.token1Name,
            pairAddress: item.pairAddress,
          },
          executionTime: new Date(item.executionTime).toLocaleString(),
          type: item.type as "SELL" | "BUY",
          quantity: item.quantity.toFixed(4),
          totalETH: item.totalETH.toFixed(4),
          totalUSD: `$${item.totalUSD.toLocaleString()}`,
          variation: item.variation,
          maker: item.maker,
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

  getTokenIcon(name: string): string {
    return getTokenIcon(name);
  }
}
