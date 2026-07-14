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
