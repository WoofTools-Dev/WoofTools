import { cache } from "../cache.service";
import { theGraphConfig } from "../../configs/blockchain.config";

const RATE_LIMIT_FREE = 30;
const CACHE_TTL = 5 * 60 * 1000;

interface GraphPool {
  id: string;
  token0: { id: string; symbol: string; name: string };
  token1: { id: string; symbol: string; name: string };
  token0Price: string;
  token1Price: string;
  volumeUSD: string;
  liquidity: string;
  txCount: string;
  createdAtTimestamp: string;
}

interface GraphPoolDayData {
  date: number;
  volumeUSD: string;
  tvlUSD: string;
  price: string;
}

interface GraphSwap {
  id: string;
  timestamp: string;
  amountUSD: string;
  amount0: string;
  amount1: string;
  token0: { symbol: string };
  token1: { symbol: string };
  pool: {
    token0: { symbol: string };
    token1: { symbol: string };
    token0Price: string;
    token1Price: string;
  };
}

async function queryGraph<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const url = theGraphConfig.apiKey
    ? theGraphConfig.uniswapV3Url.replace(
        "gateway.thegraph.com/api/",
        `gateway.thegraph.com/api/${theGraphConfig.apiKey}/`
      )
    : theGraphConfig.uniswapV3FreeUrl;

  await cache.waitForRateLimit("thegraph", RATE_LIMIT_FREE);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`The Graph HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Graph errors: ${json.errors[0].message}`);
  }
  return json.data as T;
}

export async function getTopPairs(
  limit: number = 20
): Promise<
  {
    pairAddress: string;
    token0: string;
    token1: string;
    price: number;
    volume24h: number;
    liquidity: number;
    swaps: number;
    created: Date;
  }[]
> {
  const cacheKey = `graph:topPairs:${limit}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await queryGraph<{ pools: GraphPool[] }>(
    `query TopPairs($limit: Int!) {
      pools(first: $limit, orderBy: volumeUSD, orderDirection: desc) {
        id
        token0 { id symbol name }
        token1 { id symbol name }
        token0Price
        token1Price
        volumeUSD
        liquidity
        txCount
        createdAtTimestamp
      }
    }`,
    { limit }
  );

  const results = data.pools.map((p) => ({
    pairAddress: p.id,
    token0: p.token0.symbol,
    token1: p.token1.symbol,
    price: parseFloat(p.token0Price) || 0,
    volume24h: parseFloat(p.volumeUSD) || 0,
    liquidity: parseFloat(p.liquidity) || 0,
    swaps: parseInt(p.txCount) || 0,
    created: new Date(parseInt(p.createdAtTimestamp) * 1000),
  }));

  cache.set(cacheKey, results, CACHE_TTL);
  return results;
}

export async function getPairHistory(
  pairAddress: string,
  days: number = 7
): Promise<{ prices: number[]; times: number[]; volumes: number[] }> {
  const cacheKey = `graph:pairHist:${pairAddress}:${days}`;
  const cached = cache.get<{ prices: number[]; times: number[]; volumes: number[] }>(cacheKey);
  if (cached) return cached;

  const now = Math.floor(Date.now() / 1000);
  const start = now - days * 86400;

  const data = await queryGraph<{ poolDayDatas: GraphPoolDayData[] }>(
    `query PairHistory($pairAddress: String!, $start: Int!) {
      poolDayDatas(
        where: { pool: $pairAddress, date_gte: $start }
        orderBy: date
        orderDirection: asc
      ) {
        date
        volumeUSD
        tvlUSD
      }
    }`,
    { pairAddress: pairAddress.toLowerCase(), start }
  );

  const result = {
    prices: data.poolDayDatas.map((d) => parseFloat(d.tvlUSD) || 0),
    times: data.poolDayDatas.map((d) => d.date),
    volumes: data.poolDayDatas.map((d) => parseFloat(d.volumeUSD) || 0),
  };

  cache.set(cacheKey, result, CACHE_TTL);
  return result;
}

export async function getRecentSwaps(
  pairAddress: string,
  limit: number = 50
): Promise<
  {
    type: "BUY" | "SELL";
    amountUSD: number;
    amount0: number;
    amount1: number;
    token0Symbol: string;
    token1Symbol: string;
    timestamp: Date;
  }[]
> {
  const cacheKey = `graph:swaps:${pairAddress}:${limit}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await queryGraph<{ swaps: GraphSwap[] }>(
    `query RecentSwaps($pairAddress: String!, $limit: Int!) {
      swaps(
        where: { pool: $pairAddress }
        orderBy: timestamp
        orderDirection: desc
        first: $limit
      ) {
        id
        timestamp
        amountUSD
        amount0
        amount1
        token0 { symbol }
        token1 { symbol }
        pool {
          token0 { symbol }
          token1 { symbol }
          token0Price
          token1Price
        }
      }
    }`,
    { pairAddress: pairAddress.toLowerCase(), limit }
  );

  const results = data.swaps.map((s) => {
    const amt0 = parseFloat(s.amount0);
    return {
      type: amt0 < 0 ? ("BUY" as const) : ("SELL" as const),
      amountUSD: parseFloat(s.amountUSD) || 0,
      amount0: Math.abs(amt0),
      amount1: Math.abs(parseFloat(s.amount1)),
      token0Symbol: s.pool.token0.symbol,
      token1Symbol: s.pool.token1.symbol,
      timestamp: new Date(parseInt(s.timestamp) * 1000),
    };
  });

  cache.set(cacheKey, results, CACHE_TTL);
  return results;
}

export async function getNewPairs(
  sinceHoursAgo: number = 48,
  limit: number = 20
): Promise<
  {
    pairAddress: string;
    token0: string;
    token1: string;
    createdAt: Date;
    initialLiquidity: number;
    currentLiquidity: number;
  }[]
> {
  const cacheKey = `graph:newPairs:${sinceHoursAgo}:${limit}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const since = Math.floor(Date.now() / 1000) - sinceHoursAgo * 3600;

  const data = await queryGraph<{ pools: GraphPool[] }>(
    `query NewPairs($since: Int!, $limit: Int!) {
      pools(
        where: { createdAtTimestamp_gte: $since }
        orderBy: createdAtTimestamp
        orderDirection: desc
        first: $limit
      ) {
        id
        token0 { symbol }
        token1 { symbol }
        liquidity
        createdAtTimestamp
      }
    }`,
    { since, limit }
  );

  const results = data.pools.map((p) => ({
    pairAddress: p.id,
    token0: p.token0.symbol,
    token1: p.token1.symbol,
    createdAt: new Date(parseInt(p.createdAtTimestamp) * 1000),
    initialLiquidity: parseFloat(p.liquidity) || 0,
    currentLiquidity: parseFloat(p.liquidity) || 0,
  }));

  cache.set(cacheKey, results, CACHE_TTL);
  return results;
}
