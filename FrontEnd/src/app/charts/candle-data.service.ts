import { Injectable } from '@angular/core';
import { Candle, CandleInterval } from './candle.interfaces';

@Injectable({ providedIn: 'root' })
export class CandleDataService {

  generateCandles(prices: number[], interval: CandleInterval = '1h'): Candle[] {
    if (!prices || prices.length < 2) return [];

    const intervalSec = this.intervalToSeconds(interval);
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - prices.length * intervalSec;

    return prices.slice(1).map((c, i) => {
      const o = prices[i];
      return {
        time: startTime + (i + 1) * intervalSec,
        open: o,
        high: Math.max(o, c) * 1.005,
        low: Math.min(o, c) * 0.995,
        close: c,
        volume: Math.abs(c - o) * 10000 + 500 + Math.random() * 500,
      };
    });
  }

  generateMockCandles(count: number, interval: CandleInterval = '1h'): Candle[] {
    const intervalSec = this.intervalToSeconds(interval);
    const now = Math.floor(Date.now() / 1000);
    const candles: Candle[] = [];
    let price = 100 + Math.random() * 50;

    for (let i = count; i >= 0; i--) {
      const change = (Math.random() - 0.48) * price * 0.02;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      candles.push({
        time: now - i * intervalSec,
        open,
        high,
        low,
        close,
        volume: price * (100 + Math.random() * 200),
      });
      price = close;
    }
    return candles;
  }

  priceArrayToCandles(prices: number[], interval: CandleInterval = '1h', times?: number[]): Candle[] {
    if (!prices || prices.length < 2) return [];
    const intervalSec = this.intervalToSeconds(interval);
    const now = Math.floor(Date.now() / 1000);
    const startTime = now - (prices.length - 1) * intervalSec;

    const useTimes = Array.isArray(times)
      && times.length === prices.length
      && times.every((t, i) => typeof t === 'number' && (i === 0 || times[i - 1] < t));

    return prices.slice(1).map((close, i) => {
      const open = prices[i];
      const change = Math.abs(close - open);
      return {
        time: useTimes ? times[i + 1] : startTime + (i + 1) * intervalSec,
        open,
        high: Math.max(open, close) * 1.005,
        low: Math.min(open, close) * 0.995,
        close,
        volume: change * 10000 + 500 + Math.random() * 500,
      };
    });
  }

  private intervalToSeconds(interval: CandleInterval): number {
    const map: Record<CandleInterval, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1D': 86400,
    };
    return map[interval];
  }
}
