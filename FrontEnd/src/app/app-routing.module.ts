import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppViewRouter } from './Module/app.angular.view.component';

const routes: Routes = [
  {
    path: 'woofboard',
    component: AppViewRouter.Dashboard,
  },
  {
    path: 'account',
    component: AppViewRouter.WalletConnect,
  },
  {
    path: 'multiswap',
    component: AppViewRouter.SwapWrapperComponent,
  },
  {
    path: 'live-pair',
    component: AppViewRouter.LivePairsComponent,
  },
  {
    path: 'big_swap_explorer',
    component: AppViewRouter.BigSwapExplorerComponent,
  },
  {
    path: 'daily-winners',
    component: AppViewRouter.DailyWinnersComponent,
  },
  {
    path: 'daily-losers',
    component: AppViewRouter.DailyLosersComponent,
  },
  {
    path: 'updated-rrss',
    component: AppViewRouter.UpdatedRRSSComponent,
  },
  {
    path: 'pair_explorer',
    component: AppViewRouter.PairExplorerComponent,
  },
  {
    path: 'multichart',
    component: AppViewRouter.MultiChartComponent,
  },
  {
    path: 'stats',
    component: AppViewRouter.StatsComponent,
  },
  {
    path: 'wallet_info',
    component: AppViewRouter.WalletInfoComponent,
  },
  {
    path: 'products',
    component: AppViewRouter.ProductsComponent,
  },
  {
    path: '**',
    redirectTo: 'woofboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
