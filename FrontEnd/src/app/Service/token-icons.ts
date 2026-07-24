const ICON_MAP: Record<string, string> = {
  ETH: 'assets/coins/ETH.png',
  WETH: 'assets/coins/ETH.png',
  USDC: 'assets/coins/USDC.png',
  PEPE: 'assets/coins/PEPE.png',
  LINK: 'assets/coins/LINK.png',
  USDT: 'assets/coins/USDT.png',
  UNI: 'assets/coins/UNI.png',
  AAVE: 'assets/coins/AAVE.png',
  MATIC: 'assets/coins/MATIC.png',
  SHIB: 'assets/coins/SHIB.png',
  ARB: 'assets/coins/ARB.png',
  BONK: 'assets/coins/BONK.png',
  DOGE: 'assets/coins/DOGE.png',
  FLOKI: 'assets/coins/FLOKI.png',
  OP: 'assets/coins/OP.png',
  INJ: 'assets/coins/INJ.png',
  RBN: 'assets/coins/RBN.png',
  MKR: 'assets/coins/MKR.png',
  CRV: 'assets/coins/CRV.png',
  ENS: 'assets/coins/ENS.png',
  COMP: 'assets/coins/COMP.png',
};

const FALLBACK = 'assets/coins/ETH.png';

export function getTokenIcon(name: string): string {
  const key = (name || '').toUpperCase().trim();
  return ICON_MAP[key] || FALLBACK;
}
