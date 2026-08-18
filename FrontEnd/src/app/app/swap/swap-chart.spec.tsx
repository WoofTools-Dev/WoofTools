import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

describe('pricesToCandles (inline logic)', () => {
  function pricesToCandles(prices: number[], times: number[]) {
    if (prices.length < 2) return [];
    const candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[] = [];
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      const nextPrice = i < prices.length - 1 ? prices[i + 1] : price;
      const volatility = Math.abs(nextPrice - price) * 0.3 || price * 0.01;
      const open = price;
      const close = nextPrice;
      const high = Math.max(open, close) + volatility;
      const low = Math.min(open, close) - volatility * 0.5;
      candles.push({
        time: times[i],
        open,
        high: Math.max(high, open, close),
        low: Math.min(low, open, close),
        close,
        volume: Math.floor(Math.random() * 10000 + 1000),
      });
    }
    return candles;
  }

  it('should return empty array for less than 2 prices', () => {
    expect(pricesToCandles([], [])).toEqual([]);
    expect(pricesToCandles([100], [1000])).toEqual([]);
  });

  it('should generate candles from prices and times', () => {
    const prices = [100, 110, 105];
    const times = [1000, 2000, 3000];
    const candles = pricesToCandles(prices, times);

    expect(candles.length).toBe(3);
    expect(candles[0].open).toBe(100);
    expect(candles[0].close).toBe(110);
    expect(candles[1].open).toBe(110);
    expect(candles[1].close).toBe(105);
    expect(candles[2].open).toBe(105);
    expect(candles[2].close).toBe(105);
  });

  it('should set correct timestamps', () => {
    const candles = pricesToCandles([50, 60], [1000, 2000]);
    expect(candles[0].time).toBe(1000);
    expect(candles[1].time).toBe(2000);
  });

  it('should have positive volume', () => {
    const candles = pricesToCandles([10, 20, 30], [1, 2, 3]);
    candles.forEach(c => {
      expect(c.volume).toBeGreaterThan(0);
    });
  });

  it('should have high >= max(open, close) and low <= min(open, close)', () => {
    const candles = pricesToCandles([100, 80, 120], [1, 2, 3]);
    candles.forEach(c => {
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
    });
  });
});

describe('SwapChart component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render a loading state initially', () => {
    const SwapChart = require('./swap-chart').default;
    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(SwapChart, {
        tokenAddress: '0x0000000000000000000000000000000000000000',
        tokenSymbol: 'WETH',
        chain: 'ethereum',
      })
    );

    const loadingEl = container.querySelector('.swap-chart-loading') || container.querySelector('[class*="loading"]');
    const text = container.textContent || '';
    const hasLoading = loadingEl !== null || text.includes('Cargando') || text.includes('cargando');
    expect(hasLoading).toBe(true);
    root.unmount();
  });
});
