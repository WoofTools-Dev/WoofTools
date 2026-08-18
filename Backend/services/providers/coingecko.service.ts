import { cache } from "../cache.service";
import { coingeckoConfig } from "../../configs/blockchain.config";

const RATE_LIMIT = coingeckoConfig.apiKey
  ? coingeckoConfig.proRateLimit
  : coingeckoConfig.freeRateLimit;

const CACHE_TTL_PRICES = 5 * 60 * 1000;
const CACHE_TTL_HISTORY = 10 * 60 * 1000;
const CACHE_TTL_TRENDING = 15 * 60 * 1000;

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: "application/json" };
  if (coingeckoConfig.apiKey) {
    h["x-cg-pro-api-key"] = coingeckoConfig.apiKey;
  }
  return h;
}

async function cgFetch<T>(path: string): Promise<T> {
  await cache.waitForRateLimit("coingecko", RATE_LIMIT);
  const url = `${coingeckoConfig.baseUrl}${path}`;
  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    return cgFetch<T>(path);
  }

  if (!res.ok) throw new Error(`Coingecko HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

interface CGPrice {
  [tokenId: string]: {
    usd: number;
    usd_market_cap: number;
    usd_24h_change: number;
  };
}

export async function getTokenPrice(
  tokenIds: string[]
): Promise<Record<string, { price: number; marketCap: number; change24h: number }>> {
  if (tokenIds.length === 0) return {};

  const cacheKey = `cg:price:${tokenIds.sort().join(",")}`;
  const cached = cache.get<Record<string, { price: number; marketCap: number; change24h: number }>>(cacheKey);
  if (cached) return cached;

  const ids = tokenIds.join(",");
  const data = await cgFetch<CGPrice>(
    `/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
  );

  const results: Record<string, { price: number; marketCap: number; change24h: number }> = {};
  for (const [id, v] of Object.entries(data)) {
    results[id] = {
      price: v.usd || 0,
      marketCap: v.usd_market_cap || 0,
      change24h: v.usd_24h_change || 0,
    };
  }

  cache.set(cacheKey, results, CACHE_TTL_PRICES);
  return results;
}

interface CGMarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export async function getPriceHistory(
  tokenId: string,
  days: number = 7
): Promise<{ prices: number[]; times: number[] }> {
  const cacheKey = `cg:history:${tokenId}:${days}`;
  const cached = cache.get<{ prices: number[]; times: number[] }>(cacheKey);
  if (cached) return cached;

  const data = await cgFetch<CGMarketChart>(
    `/coins/${tokenId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
  );

  const result = {
    prices: data.prices.map((p) => p[1]),
    times: data.prices.map((p) => Math.floor(p[0] / 1000)),
  };

  cache.set(cacheKey, result, CACHE_TTL_HISTORY);
  return result;
}

interface CGTrending {
  coins: { item: { id: string; symbol: string; name: string; market_cap_rank: number | null } }[];
}

export async function getTrendingCoins(): Promise<
  { id: string; symbol: string; name: string; marketCapRank: number | null }[]
> {
  const cacheKey = "cg:trending";
  const cached = cache.get<{ id: string; symbol: string; name: string; marketCapRank: number | null }[]>(cacheKey);
  if (cached) return cached;

  const data = await cgFetch<CGTrending>("/search/trending");
  const results = data.coins.map((c) => ({
    id: c.item.id,
    symbol: c.item.symbol,
    name: c.item.name,
    marketCapRank: c.item.market_cap_rank,
  }));

  cache.set(cacheKey, results, CACHE_TTL_TRENDING);
  return results;
}

export async function getTopCoinsByMarketCap(
  limit: number = 50
): Promise<
  {
    id: string;
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    change24h: number;
    volume24h: number;
  }[]
> {
  const cacheKey = `cg:topCoins:${limit}`;
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await cgFetch<any[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
  );

  const results = data.map((c: any) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    price: c.current_price || 0,
    marketCap: c.market_cap || 0,
    change24h: c.price_change_percentage_24h || 0,
    volume24h: c.total_volume || 0,
  }));

  cache.set(cacheKey, results, CACHE_TTL_PRICES);
  return results;
}
