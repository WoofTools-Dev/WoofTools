import { formatCompact, formatUsd, formatLargeNumber } from './format';

describe('format helpers', () => {
  describe('formatCompact', () => {
    it('returns compact notation for thousands', () => {
      expect(formatCompact(45200)).toBe('45.2K');
    });

    it('returns compact notation for millions', () => {
      expect(formatCompact(128500000)).toBe('128.5M');
    });

    it('returns compact notation for billions', () => {
      expect(formatCompact(42100000000)).toBe('42.1B');
    });

    it('returns plain number below 1000', () => {
      expect(formatCompact(500)).toBe('500');
    });

    it('handles null/undefined', () => {
      expect(formatCompact(null)).toBe('-');
      expect(formatCompact(undefined)).toBe('-');
    });
  });

  describe('formatUsd', () => {
    it('prefixes with $', () => {
      expect(formatUsd(128500000)).toBe('$128.5M');
    });

    it('handles null', () => {
      expect(formatUsd(null)).toBe('-');
    });
  });

  describe('formatLargeNumber', () => {
    it('uses thousands separators', () => {
      expect(formatLargeNumber(128500000)).toBe('128,500,000');
    });

    it('handles undefined', () => {
      expect(formatLargeNumber(undefined)).toBe('-');
    });
  });
});
