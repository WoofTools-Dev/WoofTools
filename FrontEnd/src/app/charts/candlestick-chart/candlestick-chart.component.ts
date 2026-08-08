import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createChart, IChartApi, ISeriesApi, CrosshairMode, UTCTimestamp, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { CandleDataService } from '../candle-data.service';
import { Candle } from '../candle.interfaces';

@Component({
  selector: 'candlestick-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candlestick-chart.component.html',
  styleUrls: ['./candlestick-chart.component.scss'],
})
export class CandlestickChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() data: number[] = [];
  @Input() times: number[] = [];
  @Input() height: number = 160;

  @ViewChild('chartContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipEl') tooltipRef!: ElementRef<HTMLDivElement>;

  private chart: IChartApi | null = null;
  private candleSeries: ISeriesApi<'Candlestick'> | null = null;
  private volumeSeries: ISeriesApi<'Histogram'> | null = null;
  private resizeObs: ResizeObserver | null = null;
  private candles: Candle[] = [];
  private initialized = false;

  constructor(
    private dataService: CandleDataService,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.initChart();
    this.setupResizeObserver();
  }

  private get hasTimes(): boolean {
    return !!this.times
      && this.times.length === this.data.length
      && this.data.length > 1
      && this.times.every((t, i) => typeof t === 'number' && (i === 0 || this.times[i - 1] < t));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['times']) {
      this.candles = this.dataService.priceArrayToCandles(this.data || [], '1h', this.times || []);
      if (this.initialized) {
        this.updateChartData();
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObs?.disconnect();
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  private initChart(): void {
    const container = this.containerRef?.nativeElement;
    if (!container || this.initialized) return;

    this.chart = createChart(container, {
      layout: {
        background: { color: '#0d0e14' },
        textColor: '#a0b4c0',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#1a1d2e' },
        horzLines: { color: '#1a1d2e' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#ea801e55',
          width: 1,
          style: 2,
          labelVisible: false,
        },
        horzLine: {
          color: '#ea801e55',
          width: 1,
          style: 2,
          labelBackgroundColor: '#ea801e',
        },
      },
      rightPriceScale: {
        borderColor: '#1e2d38',
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#1e2d38',
        timeVisible: false,
        secondsVisible: false,
        barSpacing: 3,
        minBarSpacing: 2,
        tickMarkFormatter: () => '',
      },
      handleScroll: { vertTouchDrag: false },
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceFormat: { type: 'price', minMove: 0.00000001 },
    });

    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    this.chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    this.chart.subscribeCrosshairMove(this.onCrosshairMove.bind(this));

    this.initialized = true;
    this.updateChartData();
  }

  private updateChartData(): void {
    if (!this.candleSeries || !this.volumeSeries) return;
    const candleData = this.candles.map(c => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    const volumeData = this.candles.map(c => ({
      time: c.time as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? '#22c55e66' : '#ef444466',
    }));

    this.candleSeries.setData(candleData);
    this.volumeSeries.setData(volumeData);

    const hasTimes = this.hasTimes;
    this.chart?.timeScale().applyOptions({
      timeVisible: hasTimes,
      secondsVisible: hasTimes,
      tickMarkFormatter: hasTimes
        ? (time: number) => {
            const d = new Date(time * 1000);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
          }
        : () => '',
    } as any);

    const len = this.candles.length;
    const minVisible = 40;
    if (len > minVisible) {
      this.chart?.timeScale().setVisibleLogicalRange({ from: len - minVisible, to: len });
    } else {
      this.chart?.timeScale().fitContent();
    }
  }

  private onCrosshairMove(param: any): void {
    const tooltip = this.tooltipRef?.nativeElement;
    if (!tooltip) return;

    if (!param.time || !param.point) {
      tooltip.style.display = 'none';
      return;
    }

    const candleData = param.seriesData?.get(this.candleSeries);
    if (!candleData) {
      tooltip.style.display = 'none';
      return;
    }

    const o = candleData.open as number;
    const h = candleData.high as number;
    const l = candleData.low as number;
    const c = candleData.close as number;
    const change = o !== 0 ? ((c - o) / o) * 100 : 0;
    const volData = param.seriesData?.get(this.volumeSeries);
    const volume = volData?.value ?? 0;

    const candleIdx = this.candles.findIndex(c => c.time === (param.time as number)) + 1;

    const hasTimes = this.hasTimes;
    const timeLabel = hasTimes && candleIdx > 0
      ? new Date((param.time as number) * 1000).toLocaleString()
      : `Vela #${candleIdx > 0 ? candleIdx : '?'}`;

    const fmt = (v: number) =>
      '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

    tooltip.innerHTML = `
      <div class="tooltip-time">${timeLabel}</div>
      <div class="tooltip-row">
        <span>O</span><span class="val">${fmt(o)}</span>
        <span>H</span><span class="val">${fmt(h)}</span>
      </div>
      <div class="tooltip-row">
        <span>C</span><span class="val" style="color:${change >= 0 ? '#22c55e' : '#ef4444'}">${fmt(c)}</span>
        <span>L</span><span class="val">${fmt(l)}</span>
      </div>
      <div class="tooltip-row">
        <span>Vol</span><span class="val">${volume.toFixed(0)}</span>
        <span>Chg</span><span class="val" style="color:${change >= 0 ? '#22c55e' : '#ef4444'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
      </div>
    `;

    const chartRect = this.containerRef.nativeElement.getBoundingClientRect();
    const x = Math.min(param.point.x + 12, chartRect.width - 180);
    const y = Math.max(param.point.y - 80, 0);
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.style.display = 'block';
  }

  private setupResizeObserver(): void {
    const container = this.containerRef?.nativeElement;
    if (!container) return;

    this.resizeObs = new ResizeObserver(() => {
      this.ngZone.runOutsideAngular(() => {
        const { width, height } = container.getBoundingClientRect();
        this.chart?.resize(width, height);
      });
    });
    this.resizeObs.observe(container);
  }
}
