import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardData, HotPair, LivePair, SwapTransaction, DailyWinner, DailyLoser, UpdatedRRSS, LikeStatus } from '../Interface/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error.message);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getDashboardData(chain?: string, walletAddress?: string): Observable<DashboardData[]> {
    const params = this.buildParams({ chain, walletAddress });
    return this.http.get<DashboardData[]>(`${this.apiUrl}/api/dashboard/data${params}`).pipe(catchError(this.handleError));
  }

  getHotPairs(chain?: string, walletAddress?: string): Observable<HotPair[]> {
    const params = this.buildParams({ chain, walletAddress });
    return this.http.get<HotPair[]>(`${this.apiUrl}/hotpair/hot-pairs${params}`).pipe(catchError(this.handleError));
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

  addLike(entityType: string, entityId: number, walletAddress: string): Observable<LikeStatus> {
    return this.http.post<LikeStatus>(`${this.apiUrl}/api/likes`, {
      entityType,
      entityId,
      walletAddress,
    }).pipe(catchError(this.handleError));
  }

  getLikeStatus(entityType: string, entityId: number, walletAddress?: string): Observable<LikeStatus> {
    const params = this.buildParams({ entityType, entityId: String(entityId), walletAddress });
    return this.http.get<LikeStatus>(`${this.apiUrl}/api/likes/status${params}`).pipe(catchError(this.handleError));
  }

  private buildParams(values: Record<string, string | undefined>): string {
    const parts = Object.entries(values)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`);
    return parts.length > 0 ? `?${parts.join('&')}` : '';
  }
}
