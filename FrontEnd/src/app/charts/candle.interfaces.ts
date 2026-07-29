export type CandleInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
