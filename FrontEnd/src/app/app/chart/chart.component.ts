import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

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

  chartData!: ChartConfiguration<'line'>['data'];
  chartOptions!: ChartConfiguration<'line'>['options'];

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.data || this.data.length === 0) return;

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
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: this.showAxes,
          displayColors: false,
          callbacks: {
            label: (ctx: any) => '$' + ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
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
          grid: { color: '#1e2d3844' },
          ticks: {
            display: this.showAxes,
            color: '#a0b4c0',
            font: { size: 10 },
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
      interaction: { intersect: false, mode: 'index' },
    };
  }
}
