export const SHIBASWAP = {
  router: '0xEF83bbB63E8A7442E3a4a5d28d9bBf32D7c813c8',
  factory: '0xc2b4218F137e3A5A9B98ab3AE804108F0D312CBC',
  explorerUrl: 'https://www.shibariumscan.io',
};

export interface ShibaToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
}

export const BONE_NATIVE_ADDRESS = '0x0000000000000000000000000000000000001010';

export const SHIBARIUM_TOKENS: ShibaToken[] = [
  { symbol: 'BONE', name: 'BONE', address: BONE_NATIVE_ADDRESS, decimals: 18, isNative: true },
  { symbol: 'WBONE', name: 'Wrapped BONE', address: '0xC76F4c819D820369Fb2d7C1531aB3Bb18e6fE8d8', decimals: 18 },
  { symbol: 'SHIB', name: 'Shiba Inu', address: '0x495eea66B0f8b636D441dC6a98d8F5C3D455C4c0', decimals: 18 },
  { symbol: 'LEASH', name: 'Doge Killer', address: '0x65218A41Fb92637254B4f8c97448d3dF343A3064', decimals: 18 },
  { symbol: 'CHEWY', name: 'Chewy', address: '0x2761723006d3Eb0d90B19B75654DbE543dcd974f', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xf010f12dcA0b96D2d6685bf4dB3dbB4Ad500B6Ad', decimals: 18 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xaB082b8ad96c7f47ED70ED971Ce2116469954cFB', decimals: 18 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x0726959d22361B79e4D50A5D157b044A83eC870d', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0xE984D89fb00D0B44E798A55dc41EA598B0b0899d', decimals: 18 },
  { symbol: 'TREAT', name: 'Treat', address: '0x506d8d2d9c715Eb34F514cc3EF48C7aBD19e2bc7', decimals: 18 },
];

export const ROUTER_ABI = [
  'function factory() external view returns (address)',
  'function WETH() external view returns (address)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)',
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
];

export const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function allPairsLength() external view returns (uint)',
];

export const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
];

export function getShibaTokenBySymbol(symbol: string): ShibaToken | undefined {
  const key = symbol.toUpperCase();
  return SHIBARIUM_TOKENS.find((t) => t.symbol === key);
}
