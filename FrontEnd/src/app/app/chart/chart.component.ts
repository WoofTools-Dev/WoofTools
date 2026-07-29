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

@Component({
  selector: 'token-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class TokenChartComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() color: string = '#ea801e';
  @Input() height: number = 200;
  @Input() showAxes: boolean = true;
  @Input() chartType: 'line' | 'candlestick' = 'line';

  type: keyof ChartTypeRegistry = 'line';
  chartData!: ChartConfiguration['data'];
  chartOptions!: ChartConfiguration['options'];
  plugins: any[] = [];

  private generateOHLC(prices: number[]): { x: number; o: number; h: number; l: number; c: number }[] {
    const result: { x: number; o: number; h: number; l: number; c: number }[] = [];
    for (let i = 1; i < prices.length; i++) {
      const o = prices[i - 1];
      const c = prices[i];
      const h = Math.max(o, c) * 1.005;
      const l = Math.min(o, c) * 0.995;
      result.push({ x: i, o, h, l, c });
    }
    return result;
  }

  private calculateSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += data[j];
        }
        result.push(sum / period);
      }
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

  private buildLine(): void {
    this.type = 'line';

    const gradient =
      this.data[this.data.length - 1] >= this.data[0] ? '#22c55e' : '#ef4444';

    const chartLabels = this.data.map((_, i) => {
      if (i === 0) return 'Start';
      if (i === this.data.length - 1) return 'Now';
      return '';
    });

    this.chartData = {
      labels: chartLabels,
      datasets: [
        {
          data: this.data,
          borderColor: gradient,
          backgroundColor: (ctx: any) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return gradient + '1a';
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, gradient + '33');
            g.addColorStop(1, gradient + '05');
            return g;
          },
          borderWidth: this.showAxes ? 2 : 1.5,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHitRadius: this.showAxes ? 6 : 0,
        } as any,
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: this.showAxes,
          displayColors: false,
          backgroundColor: '#0f1a24',
          titleColor: '#a0b4c0',
          bodyColor: '#e8edf0',
          borderColor: '#1e2d38',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            label: (ctx: any) =>
              '$' + ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
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
            callback: (tickValue: any) => {
              const val = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
              if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'K';
              if (val >= 1) return '$' + val.toFixed(2);
              return '$' + val.toFixed(4);
            },
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

    const ohlcData = this.generateOHLC(this.data);
    const smaData = this.calculateSMA(this.data, 3);

    this.chartData = {
      datasets: [
        {
          label: 'Price',
          data: ohlcData,
          borderColors: { up: '#22c55e', down: '#ef4444', unchanged: '#888888' },
          backgroundColors: { up: '#22c55e88', down: '#ef444488', unchanged: '#88888844' },
          borderWidth: 1,
          barPercentage: this.showAxes ? 0.6 : 0.85,
          categoryPercentage: this.showAxes ? 0.7 : 0.9,
        } as any,
        {
          label: 'SMA 3',
          type: 'line',
          data: smaData.map((v, i) => ({ x: i, y: v })),
          borderColor: '#ea801e',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          pointHitRadius: 0,
          fill: false,
          tension: 0.3,
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
          count: 5,
          maxRotation: 0,
          padding: 4,
          callback: (tickValue: any) => {
            const i = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            if (i === 1) return 'Start';
            if (i === this.data.length - 1) return 'Now';
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
          font: { size: 10 },
          padding: 4,
          maxTicksLimit: 6,
          callback: (tickValue: any) => {
            const val = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            if (val >= 1000) return '$' + (val / 1000).toFixed(1) + 'K';
            if (val >= 1) return '$' + val.toFixed(2);
            return '$' + val.toFixed(4);
          },
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
      animation: { duration: this.showAxes ? 400 : 0 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: this.showAxes,
          displayColors: false,
          backgroundColor: '#0f1a24',
          titleColor: '#a0b4c0',
          bodyColor: '#e8edf0',
          borderColor: '#1e2d38',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: () => '',
            label: (ctx: any) => {
              const d = ctx.parsed;
              if (!d) return '';
              const fmt = (v: number) =>
                '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
              return `O:${fmt(d._custom?.o ?? d.o)}  H:${fmt(d._custom?.h ?? d.h)}  L:${fmt(d._custom?.l ?? d.l)}  C:${fmt(d._custom?.c ?? d.c)}`;
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
