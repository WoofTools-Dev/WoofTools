import { getTokenIcon } from './token-icons';

describe('getTokenIcon', () => {
  it('should return ETH icon for ETH', () => {
    expect(getTokenIcon('ETH')).toBe('assets/coins/ETH.png');
  });

  it('should return ETH icon for WETH', () => {
    expect(getTokenIcon('WETH')).toBe('assets/coins/ETH.png');
  });

  it('should return correct icon for USDC', () => {
    expect(getTokenIcon('USDC')).toBe('assets/coins/USDC.png');
  });

  it('should return correct icon for PEPE', () => {
    expect(getTokenIcon('PEPE')).toBe('assets/coins/PEPE.png');
  });

  it('should return correct icon for SHIB', () => {
    expect(getTokenIcon('SHIB')).toBe('assets/coins/SHIB.png');
  });

  it('should handle lowercase input', () => {
    expect(getTokenIcon('eth')).toBe('assets/coins/ETH.png');
  });

  it('should handle mixed case input', () => {
    expect(getTokenIcon('uSdC')).toBe('assets/coins/USDC.png');
  });

  it('should handle input with whitespace', () => {
    expect(getTokenIcon('  ETH  ')).toBe('assets/coins/ETH.png');
  });

  it('should fallback to ETH for unknown token', () => {
    expect(getTokenIcon('UNKNOWN')).toBe('assets/coins/ETH.png');
  });

  it('should fallback to ETH for empty string', () => {
    expect(getTokenIcon('')).toBe('assets/coins/ETH.png');
  });

  it('should fallback to ETH for null-ish input', () => {
    expect(getTokenIcon(null as any)).toBe('assets/coins/ETH.png');
    expect(getTokenIcon(undefined as any)).toBe('assets/coins/ETH.png');
  });

  it('should cover all known tokens', () => {
    const knownTokens = [
      'ETH', 'USDC', 'PEPE', 'LINK', 'USDT', 'UNI', 'AAVE',
      'MATIC', 'SHIB', 'ARB', 'BONK', 'DOGE', 'FLOKI', 'OP', 'INJ',
      'RBN', 'MKR', 'CRV', 'ENS', 'COMP',
    ];
    knownTokens.forEach(token => {
      expect(getTokenIcon(token)).toBe(`assets/coins/${token}.png`);
    });
    expect(getTokenIcon('WETH')).toBe('assets/coins/ETH.png');
  });
});
