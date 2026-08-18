import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
  UTCTimestamp,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { environment } from "src/environments/environment";

interface PricePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceHistoryResponse {
  available: boolean;
  data?: { prices: number[]; times: number[]; tokenAddress: string; chain: string };
}

interface SwapChartProps {
  tokenAddress: string;
  tokenSymbol: string;
  chain: "ethereum" | "shibarium";
}

function pricesToCandles(prices: number[], times: number[]): PricePoint[] {
  if (prices.length < 2) return [];
  const candles: PricePoint[] = [];
  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const nextPrice = i < prices.length - 1 ? prices[i + 1] : price;
    const volatility = Math.abs(nextPrice - price) * 0.3 || price * 0.01;
    const open = price;
    const close = nextPrice;
    const high = Math.max(open, close) + volatility;
    const low = Math.min(open, close) - volatility * 0.5;
    candles.push({
      time: times[i] as UTCTimestamp,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume: Math.floor(Math.random() * 10000 + 1000),
    });
  }
  return candles;
}

export default function SwapChart({ tokenAddress, tokenSymbol, chain }: SwapChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const initChart = useCallback(() => {
    const container = containerRef.current;
    if (!container || chartRef.current) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 300;

    const chart = createChart(container, {
      width: w,
      height: h,
      layout: {
        background: { color: "#0d0e14" },
        textColor: "#a0b4c0",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "#1a1d2e" },
        horzLines: { color: "#1a1d2e" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#ea801e55", width: 1, style: 2, labelVisible: false },
        horzLine: { color: "#ea801e55", width: 1, style: 2, labelBackgroundColor: "#ea801e" },
      },
      rightPriceScale: {
        borderColor: "#1e2d38",
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#1e2d38",
        timeVisible: false,
        secondsVisible: false,
        barSpacing: 3,
        minBarSpacing: 2,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      priceFormat: { type: "price", minMove: 0.00000001 },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    resizeObsRef.current = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      chart.resize(width, height);
    });
    resizeObsRef.current.observe(container);
  }, []);

  useEffect(() => {
    initChart();
    return () => {
      resizeObsRef.current?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    const isAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenAddress);
    if (!chain || !isAddress) {
      if (!chain) return;
      setHasError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHasError(false);

    fetch(
      `${environment.apiUrl}/api/price-history?chain=${chain}&token=${tokenAddress}&days=30`
    )
      .then((r) => r.json() as Promise<PriceHistoryResponse>)
      .then((res) => {
        if (cancelled) return;

        if (!res.available || !res.data || res.data.prices.length < 2) {
          setHasError(true);
          setLoading(false);
          return;
        }

        const candles = pricesToCandles(res.data.prices, res.data.times);
        if (cancelled || candles.length === 0) return;

        const candleData = candles.map((c) => ({
          time: c.time as unknown as import("lightweight-charts").Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        const volumeData = candles.map((c) => ({
          time: c.time as unknown as import("lightweight-charts").Time,
          value: c.volume,
          color: c.close >= c.open ? "#22c55e66" : "#ef444466",
        }));

        candleSeriesRef.current?.setData(candleData);
        volumeSeriesRef.current?.setData(volumeData);

        const len = candles.length;
        if (len > 40) {
          chartRef.current?.timeScale().setVisibleLogicalRange({ from: len - 40, to: len });
        } else {
          chartRef.current?.timeScale().fitContent();
        }

        const last = candles[candles.length - 1];
        const first24h = candles[Math.max(0, candles.length - 24)];
        setCurrentPrice(last.close);
        setChange24h(
          first24h.close > 0 ? ((last.close - first24h.close) / first24h.close) * 100 : 0
        );
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setHasError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tokenAddress, chain]);

  const fmt = (v: number) =>
    v < 0.001
      ? "$" + v.toExponential(2)
      : "$" + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 320 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid #1e2d38",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>
            {tokenSymbol || "Token"}
          </span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            {chain === "ethereum" ? "ETH" : "SHIB"}
          </span>
        </div>
        {currentPrice !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>
              {fmt(currentPrice)}
            </span>
            {change24h !== null && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: change24h >= 0 ? "#22c55e" : "#ef4444",
                }}
              >
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 260,
          position: "relative",
          background: "#0d0e14",
          borderRadius: "0 0 12px 12px",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: 13,
              background: "rgba(13,14,20,0.8)",
              borderRadius: "0 0 12px 12px",
            }}
          >
            Cargando gráfico…
          </div>
        )}
        {!loading && hasError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#6b7280",
              fontSize: 13,
              background: "rgba(13,14,20,0.8)",
              borderRadius: "0 0 12px 12px",
              padding: 20,
              textAlign: "center",
            }}
          >
            <span>No se pudieron cargar los datos de precios</span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>Intenta de nuevo más tarde</span>
          </div>
        )}
      </div>
    </div>
  );
}
