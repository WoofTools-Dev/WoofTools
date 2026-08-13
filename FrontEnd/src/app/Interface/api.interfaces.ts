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
  chain: string;
  chainId?: number;
  createdAt: string;
  likedByMe?: boolean;
  myCount?: number;
  remainingLikes?: number;
}

export interface HotPair {
  id: number;
  pairName: string;
  popularity: number;
  walletAddress?: string;
  price?: number;
  previousPrices: number[];
  previousTimes?: number[];
  growthPercentage?: number;
  chain: string;
  chainId?: number;
  likedByMe?: boolean;
  myCount?: number;
  remainingLikes?: number;
}

export interface LikeStatus {
  entityType: string;
  entityId: number;
  count: number;
  likedByMe: boolean;
  myCount: number;
  remaining: number;
  maxLikes: number;
  walletAddress: string;
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
  chain: string;
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
  chain: string;
  createdAt: string;
}

export interface DailyWinner {
  id: number;
  username: string;
  date: string;
  walletAddress?: string;
  price?: number;
  previousPrices: number[];
  previousTimes?: number[];
  growthPercentage?: number;
  chain: string;
}

export interface DailyLoser {
  id: number;
  username: string;
  date: string;
  walletAddress?: string;
  price?: number;
  previousPrices: number[];
  previousTimes?: number[];
  growthPercentage?: number;
  chain: string;
}

export interface UpdatedRRSS {
  id: number;
  profileName: string;
  lastUpdated: string;
  walletAddress?: string;
  price?: number;
  previousPrices: number[];
  previousTimes?: number[];
  growthPercentage?: number;
  chain: string;
}
