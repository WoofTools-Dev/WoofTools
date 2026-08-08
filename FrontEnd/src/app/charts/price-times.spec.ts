import { generateTimes } from './price-times';

describe('generateTimes', () => {
  it('should generate the requested number of timestamps', () => {
    const times = generateTimes(5);
    expect(times.length).toBe(5);
  });

  it('should be hourly spaced by default', () => {
    const times = generateTimes(3);
    expect(times[1] - times[0]).toBe(3600);
    expect(times[2] - times[1]).toBe(3600);
  });

  it('should end at the current time', () => {
    const now = Math.floor(Date.now() / 1000);
    const times = generateTimes(4);
    expect(times[times.length - 1]).toBeGreaterThanOrEqual(now - 2);
    expect(times[times.length - 1]).toBeLessThanOrEqual(now);
  });

  it('should respect a custom interval', () => {
    const times = generateTimes(3, 600);
    expect(times[1] - times[0]).toBe(600);
    expect(times[2] - times[1]).toBe(600);
  });
});
