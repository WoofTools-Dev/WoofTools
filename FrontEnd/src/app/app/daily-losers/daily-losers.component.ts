import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { DailyLoser } from 'src/app/Interface/api.interfaces';

@Component({
  selector: 'app-daily-losers',
  templateUrl: './daily-losers.component.html',
  styleUrls: ['./daily-losers.component.css']
})
export class DailyLosersComponent implements OnInit, OnDestroy {
  losers: DailyLoser[] = [];
  filteredLosers: any[] = [];
  dataSource: any = null;
  private pollingSub!: Subscription;

  constructor(private api: ApiService) {
    this.filteredLosers = this.losers;
  }

  displayedColumns = ['position', 'username', 'price', 'growthPercentage', 'date'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.pollingSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.api.getDailyLosers())
    ).subscribe({
      next: (data: DailyLoser[]) => {
        this.losers = data;
        this.filteredLosers = this.losers;
        this.dataSource = new MatTableDataSource<DailyLoser>(this.filteredLosers);
        if (this.sort && this.paginator) {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.dataSource = new MatTableDataSource<DailyLoser>([]);
      },
    });
  }

  ngAfterViewInit() {
    if (this.dataSource && this.sort && this.paginator) {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnDestroy() {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }
}
