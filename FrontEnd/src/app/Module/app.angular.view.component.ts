import { DashboardComponent } from '../app/woof-board/dashboard.component';
import { WalletConnectComponent } from '../app/wallet-connect/wallet-connect.component';
import { SwapWrapperComponent } from '../app/swap/swap-wrapper/swap-wrapper.component';
import { LivePairsComponent } from '../app/live-pairs/live-pairs.component';
import { BigSwapExplorerComponent } from '../app/big-swap-explorer/big-swap-explorer.component';
import { DailyWinnersComponent } from '../app/daily-winners/daily-winners.component';
import { DailyLosersComponent } from '../app/daily-losers/daily-losers.component';
import { UpdatedRRSSComponent } from '../app/updated-rrss/updated-rrss.component';
import { PairExplorerComponent } from '../app/pair-explorer/pair-explorer.component';
import { MultiChartComponent } from '../app/multichart/multichart.component';
import { StatsComponent } from '../app/stats/stats.component';
import { WalletInfoComponent } from '../app/wallet-info/wallet-info.component';
import { ProductsComponent } from '../app/products/products.component';

export const AppViewComponent = [
  DashboardComponent, WalletConnectComponent, SwapWrapperComponent,
  DailyWinnersComponent, DailyLosersComponent, UpdatedRRSSComponent,
  PairExplorerComponent, MultiChartComponent, StatsComponent,
  WalletInfoComponent, ProductsComponent
];

export const AppViewRouter = {
  Dashboard: DashboardComponent,
  WalletConnect: WalletConnectComponent,
  SwapWrapperComponent: SwapWrapperComponent,
  LivePairsComponent: LivePairsComponent,
  BigSwapExplorerComponent: BigSwapExplorerComponent,
  DailyWinnersComponent,
  DailyLosersComponent,
  UpdatedRRSSComponent,
  PairExplorerComponent,
  MultiChartComponent,
  StatsComponent,
  WalletInfoComponent,
  ProductsComponent,
};
