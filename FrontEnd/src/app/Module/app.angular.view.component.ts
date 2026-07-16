import { DashboardComponent } from '../app/woof-board/dashboard.component';
import { WalletConnectComponent } from '../app/wallet-connect/wallet-connect.component';
import { SwapWrapperComponent } from '../app/swap/swap-wrapper/swap-wrapper.component';
import { LivePairsComponent } from '../app/live-pairs/live-pairs.component';
import { BigSwapExplorerComponent } from '../app/big-swap-explorer/big-swap-explorer.component';
import { PairExplorerComponent } from '../app/pair-explorer/pair-explorer.component';
import { MultiChartComponent } from '../app/multichart/multichart.component';
import { StatsComponent } from '../app/stats/stats.component';
import { WalletInfoComponent } from '../app/wallet-info/wallet-info.component';
import { ProductsComponent } from '../app/products/products.component';
export const AppViewComponent = [DashboardComponent, WalletConnectComponent , SwapWrapperComponent];
export const AppViewRouter = {
  Dashboard: DashboardComponent,
  WalletConnect: WalletConnectComponent,
  SwapWrapperComponent: SwapWrapperComponent,
  LivePairsComponent: LivePairsComponent,
  BigSwapExplorerComponent: BigSwapExplorerComponent,
  PairExplorerComponent: PairExplorerComponent,
  MultiChartComponent: MultiChartComponent,
  StatsComponent: StatsComponent,
  WalletInfoComponent: WalletInfoComponent,
  ProductsComponent: ProductsComponent
};
