export interface DashboardData {
  id: number;
  token0Name: string;
  token1Name: string;
  pairAddress: string;
  price: number;
  percentage24H: number;
  score: number;
  contracts: string;
  created: string;
  volume: string;
  swaps: string;
  liquidity: string;
  marketCap: string;
  dex: string[];
  createdAt: string;
}

export interface HotPair {
  id: number;
  pairName: string;
  popularity: number;
  walletAddress?: string;
  price?: number;
  previousPrices: number[];
  growthPercentage?: number;
}

export interface LivePair {
  id: number;
  token0Name: string;
  token1Name: string;
  pairAddress: string;
  listedSince: string;
  tokenPriceUSD: number;
  initialLiquidity: string;
  totalLiquidity: string;
  poolAmount: string;
  poolVariation: number;
  poolRemaining: string;
  contract: string;
  createdAt: string;
}

export interface SwapTransaction {
  id: number;
  token0Name: string;
  token1Name: string;
  pairAddress: string;
  executionTime: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  totalETH: number;
  totalUSD: number;
  variation: number;
  maker: string;
  createdAt: string;
}
