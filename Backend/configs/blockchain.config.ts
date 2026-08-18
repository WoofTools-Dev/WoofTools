export const blockchainConfig = {
  ethereum: {
    chainId: 1,
    rpcUrl: process.env.ETHEREUM_RPC_URL || "https://ethereum-rpc.publicnode.com",
    dexFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    dexName: "Uniswap V3",
    explorerUrl: "https://etherscan.io",
  },
  shibarium: {
    chainId: 109,
    rpcUrl: process.env.SHIBARIUM_RPC_URL || "https://rpc.shibarium.shib.io",
    dexFactory: "0xc2b4218F137e3A5A9B98ab3AE804108F0D312CBC",
    dexName: "ShibaSwap",
    explorerUrl: "https://shibariumscan.io",
  },
} as const;

export type ChainKey = keyof typeof blockchainConfig;

export const theGraphConfig = {
  apiKey: process.env.THE_GRAPH_API_KEY || "",
  uniswapV3Url: "https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  uniswapV3FreeUrl: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
};

export const coingeckoConfig = {
  apiKey: process.env.COINGECKO_API_KEY || "",
  baseUrl: "https://api.coingecko.com/api/v3",
  freeRateLimit: 30,
  proRateLimit: 500,
};
