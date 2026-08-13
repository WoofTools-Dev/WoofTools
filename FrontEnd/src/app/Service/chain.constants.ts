export type ChainKey = 'ethereum' | 'shibarium';

export interface ChainMeta {
  key: ChainKey;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
  dex: string;
  dexIcon: string;
  gasSymbol: string;
}

export const CHAINS: Record<ChainKey, ChainMeta> = {
  ethereum: {
    key: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://ethereum.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    icon: 'assets/ether.png',
    dex: 'uniswap',
    dexIcon: 'assets/uniswap.png',
    gasSymbol: 'ETH',
  },
  shibarium: {
    key: 'shibarium',
    name: 'Shibarium',
    chainId: 109,
    rpcUrl: 'https://rpc.shibarium.shib.io',
    explorerUrl: 'https://shibariumscan.io',
    icon: 'assets/shib.png',
    dex: 'shibaswap',
    dexIcon: 'assets/shibaswap.svg',
    gasSymbol: 'BONE',
  },
};

export const SUPPORTED_CHAIN_KEYS: ChainKey[] = ['ethereum', 'shibarium'];
export const SUPPORTED_CHAIN_IDS: number[] = [1, 109];

export function getChainMeta(key: ChainKey): ChainMeta {
  return CHAINS[key];
}

export function getChainMetaByChainId(chainId: number): ChainMeta | null {
  const chain = SUPPORTED_CHAIN_IDS.find((id) => id === chainId);
  if (chain === undefined) return null;
  return chainId === 109 ? CHAINS.shibarium : CHAINS.ethereum;
}

export function isSupportedChainId(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}
