import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { interval, Subscription, switchMap, startWith } from 'rxjs';
import { ApiService } from 'src/app/Service/api.service';
import { UpdatedRRSS } from 'src/app/Interface/api.interfaces';

@Component({
  selector: 'app-updated-rrss',
  templateUrl: './updated-rrss.component.html',
  styleUrls: ['./updated-rrss.component.css']
})
export class UpdatedRRSSComponent implements OnInit, OnDestroy {
  profiles: UpdatedRRSS[] = [];
  filteredProfiles: any[] = [];
  dataSource: any = null;
  private pollingSub!: Subscription;

  constructor(private api: ApiService) {
    this.filteredProfiles = this.profiles;
  }

  displayedColumns = ['position', 'profileName', 'lastUpdated', 'price', 'growthPercentage'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.pollingSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.api.getUpdatedRRSS())
    ).subscribe({
      next: (data: UpdatedRRSS[]) => {
        this.profiles = data;
        this.filteredProfiles = this.profiles;
        this.dataSource = new MatTableDataSource<UpdatedRRSS>(this.filteredProfiles);
        if (this.sort && this.paginator) {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.dataSource = new MatTableDataSource<UpdatedRRSS>([]);
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
