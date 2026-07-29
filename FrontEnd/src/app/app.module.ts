import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './Module/app.angular.material.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularUIModule } from './Module/app.angular.ui.component';
import { DashboardComponent } from './app/woof-board/dashboard.component';
import { WalletConnectComponent } from './app/wallet-connect/wallet-connect.component';
import { AppLayoutComponent } from './Module/app.angular.layout.component';
import { SwapComponent } from './app/swap/swap.component';
import { SwapWrapperComponent } from './app/swap/swap-wrapper/swap-wrapper.component';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TimeCounterComponent } from './app/time-counter/time-counter.component';
import { LivePairsComponent } from './app/live-pairs/live-pairs.component';
import { BigSwapExplorerComponent } from './app/big-swap-explorer/big-swap-explorer.component';
import { TokenChartComponent } from './app/chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
Chart.register(...registerables, CandlestickController, CandlestickElement);
@NgModule({
  declarations: [AppComponent, DashboardComponent, WalletConnectComponent, AppLayoutComponent, SwapComponent, SwapWrapperComponent, TimeCounterComponent, LivePairsComponent, BigSwapExplorerComponent, TokenChartComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularUIModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
