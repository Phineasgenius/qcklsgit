/** Splits `total` points over `parts` answers as evenly as possible (the last parts get any extra points). */
export function splitPoints(total: number, parts: number): number[] {
  const n = Math.max(1, Math.floor(parts));
  const base = Math.floor(total / n);
  const extra = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i >= n - extra ? 1 : 0));
}
