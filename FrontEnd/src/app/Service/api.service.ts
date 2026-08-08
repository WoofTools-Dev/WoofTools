import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardData, HotPair, LivePair, SwapTransaction, DailyWinner, DailyLoser, UpdatedRRSS } from '../Interface/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error.message);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getDashboardData(chain?: string): Observable<DashboardData[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<DashboardData[]>(`${this.apiUrl}/api/dashboard/data${q}`).pipe(catchError(this.handleError));
  }

  getHotPairs(chain?: string): Observable<HotPair[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<HotPair[]>(`${this.apiUrl}/hotpair/hot-pairs${q}`).pipe(catchError(this.handleError));
  }

  getLivePairs(chain?: string): Observable<LivePair[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<LivePair[]>(`${this.apiUrl}/api/live-pairs${q}`).pipe(catchError(this.handleError));
  }

  getSwaps(chain?: string): Observable<SwapTransaction[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<SwapTransaction[]>(`${this.apiUrl}/api/swaps${q}`).pipe(catchError(this.handleError));
  }

  getDailyWinners(chain?: string): Observable<DailyWinner[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<DailyWinner[]>(`${this.apiUrl}/dailyWinner/daily-winners${q}`).pipe(catchError(this.handleError));
  }

  getDailyLosers(chain?: string): Observable<DailyLoser[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<DailyLoser[]>(`${this.apiUrl}/dailyLoser/daily-losers${q}`).pipe(catchError(this.handleError));
  }

  getUpdatedRRSS(chain?: string): Observable<UpdatedRRSS[]> {
    const q = chain ? `?chain=${encodeURIComponent(chain)}` : '';
    return this.http.get<UpdatedRRSS[]>(`${this.apiUrl}/updatedRRSS/updated-rrss${q}`).pipe(catchError(this.handleError));
  }
}
