import { environment } from 'src/environments/environment';

describe('Swap fee configurable from environment', () => {
  it('should have SWAP_FEE_BPS property', () => {
    expect(environment.SWAP_FEE_BPS).toBeDefined();
    expect(typeof environment.SWAP_FEE_BPS).toBe('number');
  });

  it('should default to 0 BPS (0% fee)', () => {
    expect(environment.SWAP_FEE_BPS).toBe(0);
  });

  it('should have SWAP_FEE_RECEIVER property', () => {
    expect(environment.SWAP_FEE_RECEIVER).toBeDefined();
    expect(typeof environment.SWAP_FEE_RECEIVER).toBe('string');
  });

  it('should default to empty receiver when fee is 0', () => {
    if (environment.SWAP_FEE_BPS === 0) {
      expect(environment.SWAP_FEE_RECEIVER).toBe('');
    }
  });

  it('should compute correct fee percentage from BPS', () => {
    const bps = environment.SWAP_FEE_BPS;
    const percent = bps / 100;
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(10);
  });
});
