import { cache } from "../cache.service";

const BASE_URL = "https://api.geckoterminal.com/api/v2";
const CACHE_TTL = 5 * 60 * 1000;

interface GeckoPool {
  id: string;
  attributes: {
    address: string;
    name: string;
    base_token_id: string;
    quote_token_id: string;
    base_token_price_usd: string;
    quote_token_price_usd: string;
    volume_usd: { h24: string };
    liquidity_usd: string;
  };
}

interface GeckoPoolsResponse {
  data: GeckoPool[];
}

interface OHLCVPoint {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: number;
}

interface GeckoOHLCVResponse {
  data: {
    id: string;
    attributes: {
      ohlcv_list: number[][];
    };
  };
}

function chainToNetwork(chain: string): string {
  switch (chain) {
    case "ethereum":
      return "eth";
    case "shibarium":
      return "shibarium";
    default:
      return chain;
  }
}

function timeframeFromDays(days: number): string {
  if (days <= 1) return "minute";
  if (days <= 7) return "hour";
  if (days <= 30) return "day";
  return "day";
}

const poolCache = new Map<string, { value: string | null; ts: number }>();
const POOL_CACHE_TTL = 10 * 60 * 1000;

export async function findPool(
  tokenAddress: string,
  chain: string
): Promise<string | null> {
  const cacheKey = `gecko:pool:${chain}:${tokenAddress.toLowerCase()}`;
  const cached = poolCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < POOL_CACHE_TTL) return cached.value;

  const network = chainToNetwork(chain);
  const res = await fetch(
    `${BASE_URL}/networks/${network}/tokens/${tokenAddress}/pools?page=1`,
    { signal: AbortSignal.timeout(15_000) }
  );

  if (!res.ok) {
    poolCache.set(cacheKey, { value: null, ts: Date.now() });
    return null;
  }

  const data: GeckoPoolsResponse = await res.json();
  const pools = data.data || [];
  const poolId = pools.length > 0 ? pools[0].id.split("_")[1] || pools[0].attributes.address : null;

  poolCache.set(cacheKey, { value: poolId, ts: Date.now() });
  return poolId;
}

export async function getOHLCV(
  tokenAddress: string,
  chain: string,
  days: number = 7
): Promise<{ prices: number[]; times: number[] } | null> {
  const cacheKey = `gecko:ohlcv:${chain}:${tokenAddress.toLowerCase()}:${days}`;
  const cached = cache.get<{ prices: number[]; times: number[] }>(cacheKey);
  if (cached) return cached;

  const poolAddress = await findPool(tokenAddress, chain);
  if (!poolAddress) return null;

  const network = chainToNetwork(chain);
  const timeframe = timeframeFromDays(days);

  const res = await fetch(
    `${BASE_URL}/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}?limit=1000`,
    { signal: AbortSignal.timeout(15_000) }
  );

  if (!res.ok) return null;

  const data: GeckoOHLCVResponse = await res.json();
  const ohlcvList = data.data?.attributes?.ohlcv_list || [];

  if (ohlcvList.length === 0) return null;

  const prices: number[] = [];
  const times: number[] = [];

  for (const point of ohlcvList) {
    const [timestamp, open, high, low, close, volume] = point;
    prices.push(close || open || 0);
    times.push(Math.floor(timestamp));
  }

  const result = { prices, times };
  cache.set(cacheKey, result, CACHE_TTL);
  return result;
}
