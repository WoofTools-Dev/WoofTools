/**
 * Compact number formatting helpers used across the UI.
 */

export function formatCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return trim(value / 1_000_000_000) + 'B';
  if (abs >= 1_000_000) return trim(value / 1_000_000) + 'M';
  if (abs >= 1_000) return trim(value / 1_000) + 'K';
  return trim(value);
}

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return '$' + formatCompact(value);
}

export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function trim(value: number): string {
  return String(Math.round(value * 100) / 100);
}
