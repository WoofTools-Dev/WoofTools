import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ApiService } from 'src/app/Service/api.service';
import { SwapTransaction } from 'src/app/Interface/api.interfaces';

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
  filteredPairs: any[] = [];
  dataSource: MatTableDataSource<TokenInfo> = new MatTableDataSource<TokenInfo>([]);

  constructor(
    private api: ApiService
  ) {}

  displayedColumns = [
    'pairInfo', 'executionTime', 'type', 'quantity',
    'totalETH', 'totalUSD', 'variation', 'maker', 'actions',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  search(event: any) {
    let value = event.target.value;
    this.filteredPairs = this.pairList.filter((item: any) => {
      return (
        item.pairInfo.token0Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.token1Name.toLowerCase().includes(value.toLowerCase()) ||
        item.pairInfo.pairAddress.toLowerCase().includes(value.toLowerCase())
      );
    });
    this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs);
    this.applySortAndPaginator();
  }

  ngOnInit(): void {
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
        this.filteredPairs = this.pairList;
        this.dataSource = new MatTableDataSource<TokenInfo>(this.filteredPairs);
        this.applySortAndPaginator();
      },
      error: () => {
        this.dataSource = new MatTableDataSource<TokenInfo>([]);
      },
    });
  }

  ngAfterViewInit() {
    this.applySortAndPaginator();
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
