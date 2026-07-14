import { DashboardComponent } from '../app/woof-board/dashboard.component';
import { WalletConnectComponent } from '../app/wallet-connect/wallet-connect.component';
import { SwapWrapperComponent } from '../app/swap/swap-wrapper/swap-wrapper.component';
import { LivePairsComponent } from '../app/live-pairs/live-pairs.component';
import { BigSwapExplorerComponent } from '../app/big-swap-explorer/big-swap-explorer.component';
export const AppViewComponent = [DashboardComponent, WalletConnectComponent , SwapWrapperComponent];
export const AppViewRouter = {
  Dashboard: DashboardComponent,
  WalletConnect: WalletConnectComponent,
  SwapWrapperComponent: SwapWrapperComponent,
  LivePairsComponent: LivePairsComponent,
  BigSwapExplorerComponent: BigSwapExplorerComponent
};
