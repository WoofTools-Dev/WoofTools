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

    this.chartData = {
      labels: this.data.map((_, i) => i.toString()),
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
          pointHitRadius: 0,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: this.showAxes, grid: { display: false }, ticks: { display: false } },
        y: {
          display: this.showAxes,
          grid: { color: '#1e2d3833' },
          ticks: { display: false },
          border: { display: false },
        },
      },
      interaction: { intersect: false, mode: 'index' },
    };
  }
}
