import { coingeckoService, geckoterminalService } from "./providers";
import { getCoinGeckoId, resolveTokenForChain } from "../configs/token-map";
import { resolveCoinGeckoIdByAddress } from "./providers/coingecko.service";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: PriceHistoryResult; ts: number }>();
const inflight = new Map<string, Promise<PriceHistoryResult>>();

export interface PriceHistoryResult {
  prices: number[];
  times: number[];
  tokenAddress: string;
  chain: string;
}

export async function getPriceHistory(
  chain: string,
  tokenAddress: string,
  days: number = 30
): Promise<PriceHistoryResult> {
  const key = `${chain}:${tokenAddress.toLowerCase()}:${days}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = fetchAndCache(chain, tokenAddress, days, key);
  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

async function fetchAndCache(
  chain: string,
  tokenAddress: string,
  days: number,
  key: string
): Promise<PriceHistoryResult> {
  let result: PriceHistoryResult | null = null;

  if (chain === "ethereum" || chain === "shibarium") {
    result = await fetchFromCoinGecko(tokenAddress, chain, days);
    if (!result) {
      result = await fetchFromGeckoTerminal(tokenAddress, chain, days);
    }
  }

  if (result) {
    cache.set(key, { data: result, ts: Date.now() });
    return result;
  }

  const empty: PriceHistoryResult = { prices: [], times: [], tokenAddress, chain };
  return empty;
}

async function fetchFromCoinGecko(
  tokenAddress: string,
  chain: string,
  days: number
): Promise<PriceHistoryResult | null> {
  const resolved = resolveTokenForChain(tokenAddress, chain);
  let coinGeckoId = resolved.coinGeckoId ?? getCoinGeckoId(resolved.queryAddress);

  if (!coinGeckoId) {
    coinGeckoId = await resolveCoinGeckoIdByAddress(chain, tokenAddress);
  }
  if (!coinGeckoId) return null;

  try {
    const data = await coingeckoService.getPriceHistory(coinGeckoId, days);
    if (!data.prices || data.prices.length < 2) return null;
    return { prices: data.prices, times: data.times, tokenAddress, chain };
  } catch (err) {
    console.error(`priceHistory: CoinGecko failed for ${coinGeckoId}:`, err);
    return null;
  }
}

async function fetchFromGeckoTerminal(
  tokenAddress: string,
  chain: string,
  days: number
): Promise<PriceHistoryResult | null> {
  const resolved = resolveTokenForChain(tokenAddress, chain);
  try {
    const data = await geckoterminalService.getOHLCV(resolved.queryAddress, chain, days);
    if (!data || !data.prices || data.prices.length < 2) return null;
    return { prices: data.prices, times: data.times, tokenAddress, chain };
  } catch (err) {
    console.error(`priceHistory: GeckoTerminal failed for ${tokenAddress}:`, err);
    return null;
  }
}
