import { Component } from '@angular/core';

export interface ProductCard {
  title: string;
  description: string;
  icon: string;
  route?: string;
  url?: string;
  badge?: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent {
  products: ProductCard[] = [
    {
      title: 'WOOFboard',
      description: 'Dashboard with hot pairs, scores and real-time market data.',
      icon: 'home',
      route: 'woofboard',
    },
    {
      title: 'Pair Explorer',
      description: 'Search and explore every trading pair with its liquidity details.',
      icon: 'dashboard',
      route: 'pair_explorer',
    },
    {
      title: 'Live New Pairs',
      description: 'Newly listed pairs with pool variation tracked in real time.',
      icon: 'rocket_launch',
      route: 'live-pair',
    },
    {
      title: 'Big Swap Explorer',
      description: 'Monitor the largest swaps across Ethereum and Shibarium.',
      icon: 'currency_exchange',
      route: 'big_swap_explorer',
    },
    {
      title: 'MultiChart',
      description: 'Compare hot pair charts side by side on one screen.',
      icon: 'window',
      route: 'multichart',
    },
    {
      title: 'MultiSwap',
      description: 'Swap tokens using KyberSwap on Ethereum and ShibaSwap on Shibarium.',
      icon: 'data_saver_on',
      route: 'multiswap',
    },
    {
      title: 'Stats',
      description: 'Market-wide statistics, top gainers and top makers.',
      icon: 'pie_chart',
      route: 'stats',
    },
    {
      title: 'Wallet Info',
      description: 'Check native balances for any address on the active chain.',
      icon: 'account_balance_wallet',
      route: 'wallet_info',
    },
    {
      title: 'Telegram',
      description: 'Join the WoofTools community on Telegram.',
      icon: 'send',
      url: 'https://t.me/woof_tools/',
      badge: 'Community',
    },
    {
      title: 'Twitter',
      description: 'Follow WoofTools for the latest announcements.',
      icon: 'tag',
      url: 'https://twitter.com/woof_tools/',
      badge: 'Social',
    },
    {
      title: 'Medium',
      description: 'Read WoofTools articles and product updates.',
      icon: 'article',
      url: 'https://medium.com/@woof-tools/',
      badge: 'Blog',
    },
    {
      title: 'Instagram',
      description: 'Visual updates from the WoofTools team.',
      icon: 'photo_camera',
      url: 'https://www.instagram.com/woof_tools/',
      badge: 'Social',
    },
  ];
}
