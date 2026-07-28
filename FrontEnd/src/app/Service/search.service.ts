import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private _query$ = new BehaviorSubject<string>('');
  query$ = this._query$.asObservable();

  setQuery(value: string) {
    this._query$.next(value);
  }

  getQuery(): string {
    return this._query$.value;
  }
}
