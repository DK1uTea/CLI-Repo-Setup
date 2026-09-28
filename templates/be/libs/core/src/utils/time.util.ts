/** Parse duration strings like "15m", "1h", "1d" to milliseconds */
export function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 15 * 60 * 1000; // fallback 15m
  const value = parseInt(match[1]);
  const unit: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unit[match[2]];
}
