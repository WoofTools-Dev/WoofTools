import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

const crosshairPlugin = {
  id: 'crosshair',
  afterDraw(chart: Chart) {
    const tooltip = chart.tooltip;
    if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints?.length) return;
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const x = tooltip.dataPoints[0].element?.x;
    if (!x || x < chartArea.left || x > chartArea.right) return;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ea801e55';
    ctx.lineWidth = 1;
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

function formatPrice(v: number): string {
  return '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

@Component({
  selector: 'token-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class TokenChartComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() times: number[] = [];
  @Input() height: number = 200;
  @Input() showAxes: boolean = true;
  @Input() chartType: 'line' | 'candlestick' = 'line';

  type: keyof ChartTypeRegistry = 'line';
  chartData!: ChartConfiguration['data'];
  chartOptions!: ChartConfiguration['options'];
  plugins: any[] = [];

  private hasTimes(): boolean {
    return this.times && this.times.length === this.data.length && this.data.length > 0;
  }

  private formatTime(ts: number): string {
    const d = new Date(ts * 1000);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private generateOHLC(prices: number[]): { x: number; o: number; h: number; l: number; c: number }[] {
    const result: { x: number; o: number; h: number; l: number; c: number }[] = [];
    for (let i = 1; i < prices.length; i++) {
      const o = prices[i - 1];
      const c = prices[i];
      const h = Math.max(o, c) * 1.005;
      const l = Math.min(o, c) * 0.995;
      result.push({ x: this.hasTimes() ? this.times[i] : i, o, h, l, c });
    }
    return result;
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.data || this.data.length < 2) {
      this.chartData = undefined as any;
      return;
    }

    this.plugins = this.showAxes ? [crosshairPlugin] : [];

    if (this.chartType === 'candlestick') {
      this.buildCandlestick();
    } else {
      this.buildLine();
    }
  }

  private buildLabel(i: number): string {
    if (this.hasTimes()) {
      const ts = this.times[i];
      if (i === 0) return this.formatTime(ts);
      if (i === this.data.length - 1) return 'Now';
      return '';
    }
    if (i === 0) return 'Start';
    if (i === this.data.length - 1) return 'Now';
    return '';
  }

  private buildLine(): void {
    this.type = 'line';

    const trendUp = this.data[this.data.length - 1] >= this.data[0];
    const color = trendUp ? '#22c55e' : '#ef4444';

    const chartLabels = this.data.map((_, i) => this.buildLabel(i));

    this.chartData = {
      labels: chartLabels,
      datasets: [
        {
          data: this.data,
          borderColor: color,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return color + '1a';
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, color + '33');
            g.addColorStop(1, color + '05');
            return g;
          },
          borderWidth: this.showAxes ? 2 : 1.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: this.showAxes ? 8 : 4,
        } as any,
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: '#0f1a24',
          titleColor: '#a0b4c0',
          bodyColor: '#e8edf0',
          borderColor: '#1e2d38',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: (ctx: any) => formatPrice(ctx.parsed.y),
          },
        },
      },
      scales: {
        x: {
          display: this.showAxes,
          grid: { display: false },
          ticks: {
            display: this.showAxes,
            color: '#a0b4c0',
            font: { size: 10 },
            maxRotation: 0,
          },
          border: { display: false },
        },
        y: {
          display: this.showAxes,
          position: 'right',
          grid: { color: '#1e2d3844', drawTicks: false },
          ticks: {
            display: this.showAxes,
            color: '#a0b4c0',
            font: { size: 10 },
            padding: 4,
            maxTicksLimit: 6,
            callback: (v: any) => formatPrice(typeof v === 'number' ? v : parseFloat(v)),
          },
          border: { display: false },
        },
      },
      interaction: { intersect: false, mode: 'index', axis: 'x' },
      hover: { mode: 'index', intersect: false },
    };
  }

  private buildCandlestick(): void {
    this.type = 'candlestick';
    const totalCandles = this.data.length - 1;

    const ohlcData = this.generateOHLC(this.data);

    this.chartData = {
      datasets: [
        {
          data: ohlcData,
          borderColors: { up: '#22c55e', down: '#ef4444', unchanged: '#888888' },
          backgroundColors: { up: '#22c55e88', down: '#ef444488', unchanged: '#88888844' },
          borderWidth: 1,
          barPercentage: this.showAxes ? 0.35 : 0.5,
          categoryPercentage: this.showAxes ? 0.9 : 0.95,
        } as any,
      ],
    };

    const axisConfig: any = this.showAxes ? {
      x: {
        type: 'linear',
        display: true,
        grid: { display: false },
        ticks: {
          color: '#a0b4c0',
          font: { size: 10 },
          count: this.showAxes && this.height <= 50 ? 3 : Math.min(totalCandles, 7),
          maxRotation: 0,
          padding: 4,
          callback: (tickValue: any) => {
            const i = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            if (this.hasTimes()) {
              const d = new Date(i * 1000);
              return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }
            if (i === 1) return 'Start';
            if (i === totalCandles) return 'Now';
            return '';
          },
        },
        border: { display: false },
      },
      y: {
        display: true,
        position: 'right',
        grid: { color: '#1e2d3844', drawTicks: false },
        ticks: {
          color: '#a0b4c0',
          font: { size: this.height <= 50 ? 8 : 10 },
          padding: 2,
          maxTicksLimit: this.height <= 50 ? 4 : 6,
          autoSkip: true,
          callback: (v: any) => formatPrice(typeof v === 'number' ? v : parseFloat(v)),
        },
        border: { display: false },
      },
    } : {
      x: { type: 'linear', display: false },
      y: { display: false },
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: this.showAxes ? 300 : 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          displayColors: false,
          backgroundColor: '#0f1a24',
          titleColor: '#a0b4c0',
          bodyColor: '#e8edf0',
          borderColor: '#1e2d38',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            title: (items: any[]) => {
              if (this.hasTimes() && items.length > 0) {
                const idx = items[0].dataIndex;
                const ts = this.times[idx + 1];
                if (ts !== undefined) return this.formatTime(ts);
              }
              return '';
            },
            label: (ctx: any) => {
              const d = ctx.parsed._custom || ctx.parsed;
              return `Price: ${formatPrice(ctx.parsed.y)}  |  O:${formatPrice(d.o)}  H:${formatPrice(d.h)}  L:${formatPrice(d.l)}  C:${formatPrice(d.c)}`;
            },
          },
        },
      },
      scales: axisConfig,
      interaction: { intersect: false, mode: 'index', axis: 'x' },
      hover: { mode: 'index', intersect: false },
    };
  }
}
