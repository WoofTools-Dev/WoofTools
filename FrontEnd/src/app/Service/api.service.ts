import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DashboardData, HotPair, LivePair, SwapTransaction } from '../Interface/api.interfaces';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error.message);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getDashboardData(): Observable<DashboardData[]> {
    return this.http.get<DashboardData[]>(`${this.apiUrl}/api/dashboard/data`).pipe(catchError(this.handleError));
  }

  getHotPairs(): Observable<HotPair[]> {
    return this.http.get<HotPair[]>(`${this.apiUrl}/hotpair/hot-pairs`).pipe(catchError(this.handleError));
  }

  getLivePairs(): Observable<LivePair[]> {
    return this.http.get<LivePair[]>(`${this.apiUrl}/api/live-pairs`).pipe(catchError(this.handleError));
  }

  getSwaps(): Observable<SwapTransaction[]> {
    return this.http.get<SwapTransaction[]>(`${this.apiUrl}/api/swaps`).pipe(catchError(this.handleError));
  }
}
