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

const ETHEREUM_POPULAR_TOKENS: SwapTokenMeta[] = [
  { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  { symbol: 'MKR', name: 'Maker', address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18 },
  { symbol: 'SUSHI', name: 'SushiSwap', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', decimals: 18 },
  { symbol: 'MATIC', name: 'Polygon', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', decimals: 18 },
  { symbol: 'BAT', name: 'Basic Attention Token', address: '0x0D8775F648430679A709E98d280BC429A13bf3AC', decimals: 18 },
  { symbol: 'TUSD', name: 'TrueUSD', address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', decimals: 18 },
  { symbol: 'YFI', name: 'yearn.finance', address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', decimals: 18 },
  { symbol: 'CRV', name: 'Curve DAO Token', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18 },
  { symbol: '1INCH', name: '1inch', address: '0x111111111117dC0aa78b770fA6A738034120C302', decimals: 18 },
  { symbol: 'COMP', name: 'Compound', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', decimals: 18 },
  { symbol: 'SHIB', name: 'Shiba Inu', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4c5', decimals: 18 },
  { symbol: 'RETH', name: 'Rocket Pool ETH', address: '0xae78736Cd615f374D3085123A210448E74Fc6393', decimals: 18 },
  { symbol: 'STETH', name: 'Lido Staked Ether', address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18 },
  { symbol: 'WSTETH', name: 'Wrapped stETH', address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', decimals: 18 },
  { symbol: 'INJ', name: 'Injective Protocol', address: '0xD5147bc86a1509772f9c1311094fa1dafA10Eb8a', decimals: 18 },
  { symbol: 'HOOK', name: 'Hooked Protocol', address: '0x2ba592F78dB6436527729929AAf6c908497cB200', decimals: 18 },
  { symbol: 'SAND', name: 'The Sandbox', address: '0x3845badAde8E6dFF049820680d1C14bd39C38fcA', decimals: 18 },
  { symbol: 'MANA', name: 'Decentraland', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908eC957', decimals: 18 },
  { symbol: 'PEPE', name: 'Pepe', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18 },
  { symbol: 'APE', name: 'ApeCoin', address: '0x4d224452801ACEd8B2F0aebE15537936a91294BE', decimals: 18 },
  { symbol: 'ZRX', name: '0x', address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498', decimals: 18 },
  { symbol: 'SNX', name: 'Synthetix Network Token', address: '0x0258C4B19842F625C801CfaA1B8f82C0F70F2222', decimals: 18 },
  { symbol: 'GAL', name: 'Galxe', address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18 },
  { symbol: 'OCEAN', name: 'Ocean Protocol', address: '0x967da4048cD07aB37855c0e434D250012f6435ef', decimals: 18 },
  { symbol: 'FTM', name: 'Fantom', address: '0x90B3832e2F2fDe53F7A12B037aD3a1A536E4F5D7', decimals: 18 },
  { symbol: 'NEAR', name: 'NEAR Protocol', address: '0x85F17Cf997934a597031b2E18a9aB6ebd4B9f6a4', decimals: 24 },
  { symbol: 'WOO', name: 'WOO Network', address: '0xf57b2c51ded3a29c68F88872D7bFaF2BB4C8BE3D', decimals: 18 },
  { symbol: 'ENS', name: 'Ethereum Name Service', address: '0x3212b29E33587A00FB1C83346f5dBFA69A458923', decimals: 18 },
  { symbol: 'LDO', name: 'Lido DAO', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18 },
  { symbol: 'RPL', name: 'Rocket Pool', address: '0xD33526068D218cE645800B938cC800Db27C0d778', decimals: 18 },
  { symbol: 'BAL', name: 'Balancer', address: '0xba100000625a3754423978a60c9317c58a424e3D', decimals: 18 },
  { symbol: 'DYDX', name: 'dYdX', address: '0x92D6C1e31e1459956434EFd4dC405dd3Dca7E3B0', decimals: 18 },
];

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
    // API failed
  }

  if (all.length === 0) {
    if (chainId === 1) {
      tokenListCache.set(chainId, ETHEREUM_POPULAR_TOKENS);
      return ETHEREUM_POPULAR_TOKENS;
    }
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
