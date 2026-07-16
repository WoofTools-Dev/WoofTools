import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData, LivePair, SwapTransaction } from '../Interface/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData[]> {
    return this.http.get<DashboardData[]>(`${this.apiUrl}/api/dashboard/data`);
  }

  getLivePairs(): Observable<LivePair[]> {
    return this.http.get<LivePair[]>(`${this.apiUrl}/api/live-pairs`);
  }

  getSwaps(): Observable<SwapTransaction[]> {
    return this.http.get<SwapTransaction[]>(`${this.apiUrl}/api/swaps`);
  }
}
