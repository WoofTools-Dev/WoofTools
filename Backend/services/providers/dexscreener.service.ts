import { cache } from "../cache.service";

const BASE_URL = "https://api.dexscreener.com";
const CACHE_TTL = 5 * 60 * 1000;

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  volume: { h24: number; h6: number; h1: number };
  priceChange: { h24: number; h6: number; h1: number };
  liquidity: { usd: number; base: number; quote: number };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

export interface DexScreenerTokenData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  pairAddress: string;
  baseToken: string;
  quoteToken: string;
  dex: string;
}

interface TopPairResult {
  pairAddress: string;
  token0: string;
  token1: string;
  price: number;
  volume24h: number;
  liquidity: number;
  swaps: number;
  created: Date;
}

const SHIBARIUM_TOKENS = [
  "0x2761723006d3Eb0d90B19B75654DbE543dcd974f",
  "0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8",
  "0x495eea66B0f8b636D441dC6a98d8F5C3D455C4c0",
  "0x65218A41Fb92637254B4f8c97448d3dF343A3064",
  "0x506d8d2d9c715Eb34F514cc3EF48C7aBD19e2bc7",
];

const ETHEREUM_TOKENS = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4c",
  "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  "0xD533a949740bb3306d119CC777fa900bA034cd52",
];

function chainToDexId(chain: string): string {
  return chain === "shibarium" ? "shibarium" : "ethereum";
}

export async function getTopPairsFromDexScreener(
  chain: string,
  limit: number = 20
): Promise<TopPairResult[]> {
  const cacheKey = `dexscreener:topPairs:${chain}:${limit}`;
  const cached = cache.get<TopPairResult[]>(cacheKey);
  if (cached) return cached;

  const tokens = chain === "shibarium" ? SHIBARIUM_TOKENS : ETHEREUM_TOKENS;
  const dexId = chainToDexId(chain);
  const allPairs: TopPairResult[] = [];

  for (const tokenAddr of tokens) {
    try {
      const pairs = await getTokenPairs(tokenAddr, dexId);
      for (const p of pairs) {
        if (p.volume24h > 0 || p.liquidity > 0) {
          allPairs.push({
            pairAddress: p.pairAddress,
            token0: p.baseToken,
            token1: p.quoteToken,
            price: p.price,
            volume24h: p.volume24h,
            liquidity: p.liquidity,
            swaps: 0,
            created: new Date(),
          });
        }
      }
    } catch {
      // skip individual token errors
    }
  }

  const sorted = allPairs
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, limit);

  cache.set(cacheKey, sorted, CACHE_TTL);
  return sorted;
}

export async function getTokenPairs(
  tokenAddress: string,
  chain: string = "shibarium"
): Promise<DexScreenerTokenData[]> {
  const cacheKey = `dexscreener:pairs:${chain}:${tokenAddress.toLowerCase()}`;
  const cached = cache.get<DexScreenerTokenData[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${BASE_URL}/tokens/v1/${chain}/${tokenAddress}`,
    { signal: AbortSignal.timeout(15_000) }
  );

  if (!res.ok) throw new Error(`DexScreener HTTP ${res.status}`);

  const data: DexScreenerPair[] = await res.json();
  const results: DexScreenerTokenData[] = (data || []).map((p) => ({
    price: parseFloat(p.priceUsd) || 0,
    priceChange24h: p.priceChange?.h24 || 0,
    volume24h: p.volume?.h24 || 0,
    liquidity: p.liquidity?.usd || 0,
    pairAddress: p.pairAddress,
    baseToken: p.baseToken.symbol,
    quoteToken: p.quoteToken.symbol,
    dex: p.dexId,
  }));

  cache.set(cacheKey, results, CACHE_TTL);
  return results;
}

export async function getTokenPrice(
  tokenAddress: string,
  chain: string = "shibarium"
): Promise<number | null> {
  const pairs = await getTokenPairs(tokenAddress, chain);
  if (pairs.length === 0) return null;
  return pairs[0].price;
}
