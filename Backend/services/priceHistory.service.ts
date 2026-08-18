import { coingeckoService, geckoterminalService } from "./providers";
import { getCoinGeckoId } from "../configs/token-map";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: PriceHistoryResult; ts: number }>();

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

  let result: PriceHistoryResult | null = null;

  if (chain === "ethereum") {
    result = await fetchFromCoinGecko(tokenAddress, chain, days);
  } else if (chain === "shibarium") {
    result = await fetchFromGeckoTerminal(tokenAddress, chain, days);
  }

  if (!result) {
    result = { prices: [], times: [], tokenAddress, chain };
  }

  cache.set(key, { data: result, ts: Date.now() });
  return result;
}

async function fetchFromCoinGecko(
  tokenAddress: string,
  chain: string,
  days: number
): Promise<PriceHistoryResult | null> {
  const coinGeckoId = getCoinGeckoId(tokenAddress);
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
  try {
    const data = await geckoterminalService.getOHLCV(tokenAddress, chain, days);
    if (!data || !data.prices || data.prices.length < 2) return null;
    return { prices: data.prices, times: data.times, tokenAddress, chain };
  } catch (err) {
    console.error(`priceHistory: GeckoTerminal failed for ${tokenAddress}:`, err);
    return null;
  }
}
