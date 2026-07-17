import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DashboardData, LivePair, SwapTransaction, DailyWinner, DailyLoser, HotPair, UpdatedRRSS } from '../Interface/api.interfaces';

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

  getDailyWinners(): Observable<DailyWinner[]> {
    return this.http.get<DailyWinner[]>(`${this.apiUrl}/dailyWinner/daily-winners`);
  }

  getDailyLosers(): Observable<DailyLoser[]> {
    return this.http.get<DailyLoser[]>(`${this.apiUrl}/dailyLoser/daily-losers`);
  }

  getHotPairs(): Observable<HotPair[]> {
    return this.http.get<HotPair[]>(`${this.apiUrl}/hotpair/hot-pairs`);
  }

  getUpdatedRRSS(): Observable<UpdatedRRSS[]> {
    return this.http.get<UpdatedRRSS[]>(`${this.apiUrl}/updatedRRSS/updated-rrss`);
  }
}
