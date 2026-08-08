export function generateTimes(count: number, intervalSec = 3600): number[] {
  const now = Math.floor(Date.now() / 1000);
  const times: number[] = [];
  for (let i = count - 1; i >= 0; i--) {
    times.push(now - i * intervalSec);
  }
  return times;
}
