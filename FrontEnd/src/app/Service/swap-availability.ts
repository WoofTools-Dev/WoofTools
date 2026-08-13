import { getShibaTokenBySymbol } from './shibaswap';

export type SwapNetwork = 'ethereum' | 'shibarium';

export interface SwapTokenMeta {
  symbol: string;
  name?: string;
  address: string;
  decimals: number;
}

const NETWORK_CHAIN_ID: Record<SwapNetwork, number> = {
  ethereum: 1,
  shibarium: 109,
};

const KYBER_TOKEN_LIST_URL = (chainId: number, page: number) =>
  `https://aggregator-api.kyberswap.com/${chainId}/api/v1/tokens?pageSize=1000&page=${page}`;

const tokenListCache = new Map<number, SwapTokenMeta[] | null>();

function toMeta(raw: any): SwapTokenMeta | null {
  if (!raw || !raw.symbol || !raw.address) return null;
  return {
    symbol: String(raw.symbol).toUpperCase(),
    name: raw.name,
    address: raw.address,
    decimals: typeof raw.decimals === 'number' ? raw.decimals : 18,
  };
}

async function fetchKyberTokenList(chainId: number): Promise<SwapTokenMeta[] | null> {
  if (tokenListCache.has(chainId)) {
    return tokenListCache.get(chainId) ?? null;
  }

  const all: SwapTokenMeta[] = [];
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(KYBER_TOKEN_LIST_URL(chainId, page));
      if (!res.ok) break;
      const json = await res.json();
      const raw = json?.data?.tokens ?? json?.tokens ?? [];
      if (!Array.isArray(raw) || raw.length === 0) break;
      const metas = raw.map(toMeta).filter((t: SwapTokenMeta | null): t is SwapTokenMeta => t !== null);
      all.push(...metas);
      if (raw.length < 1000) break;
    }
  } catch {
    tokenListCache.set(chainId, null);
    return null;
  }

  if (all.length === 0) {
    tokenListCache.set(chainId, null);
    return null;
  }

  tokenListCache.set(chainId, all);
  return all;
}

function getShibaMeta(symbol: string): SwapTokenMeta | null {
  const token = getShibaTokenBySymbol(symbol);
  if (!token) return null;
  return { symbol: token.symbol, name: token.name, address: token.address, decimals: token.decimals };
}

export function chainIdForNetwork(network: SwapNetwork): number {
  return NETWORK_CHAIN_ID[network];
}

/**
 * Resolves token metadata (address/decimals) for a network+symbol.
 * Returns null when the token is not known or the list could not be fetched.
 */
export async function getTokenMeta(
  network: SwapNetwork,
  symbol: string
): Promise<SwapTokenMeta | null> {
  const key = symbol.trim().toUpperCase();
  if (!key) return null;
  if (network === 'shibarium') return getShibaMeta(key);

  const tokens = await fetchKyberTokenList(NETWORK_CHAIN_ID.ethereum);
  if (!tokens) return null;
  return tokens.find((t) => t.symbol === key) ?? null;
}

/**
 * Checks whether a token can be traded on the swapper of the given network.
 * - shibarium: checked against the fixed SHIBARIUM_TOKENS list.
 * - ethereum: checked against the KyberSwap aggregator token list.
 * Returns null when the availability could not be determined (network error),
 * callers should treat null as "unknown" and NOT block the user.
 */
export async function isTokenAvailable(
  network: SwapNetwork,
  symbol: string
): Promise<boolean | null> {
  const key = symbol.trim().toUpperCase();
  if (!key) return false;
  if (network === 'shibarium') return getShibaMeta(key) !== null;

  const tokens = await fetchKyberTokenList(NETWORK_CHAIN_ID.ethereum);
  if (!tokens) return null;
  return tokens.some((t) => t.symbol === key);
}
