import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { DailyWinner } from 'src/app/Interface/api.interfaces';

@Component({
  selector: 'app-daily-winners',
  templateUrl: './daily-winners.component.html',
  styleUrls: ['./daily-winners.component.css']
})
export class DailyWinnersComponent implements OnInit, OnDestroy {
  winners: DailyWinner[] = [];
  filteredWinners: any[] = [];
  dataSource: any = null;
  private pollingSub!: Subscription;

  constructor(private api: ApiService) {
    this.filteredWinners = this.winners;
  }

  displayedColumns = ['position', 'username', 'price', 'growthPercentage', 'date'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.pollingSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.api.getDailyWinners())
    ).subscribe({
      next: (data: DailyWinner[]) => {
        this.winners = data;
        this.filteredWinners = this.winners;
        this.dataSource = new MatTableDataSource<DailyWinner>(this.filteredWinners);
        if (this.sort && this.paginator) {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.dataSource = new MatTableDataSource<DailyWinner>([]);
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
