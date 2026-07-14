import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CoinGeckoInterface } from '../Interface/coin-gecko.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoinGeckoService {
  UrlApi =
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en';

  constructor(private http: HttpClient) {}

  getCoin(): Observable<CoinGeckoInterface[]> {
    return this.http.get<CoinGeckoInterface[]>(`${this.UrlApi}`);
  }
}
