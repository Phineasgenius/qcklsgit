import type { StreakInfo } from '@/types';

const IST_MS = 5.5 * 3600 * 1000;

/** Calendar day (YYYY-MM-DD) in IST for a timestamp. */
export function istDay(input: string | number): string {
  const t = typeof input === 'number' ? input : new Date(input).getTime();
  return new Date(t + IST_MS).toISOString().slice(0, 10);
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/**
 * Streak = consecutive IST days on which the member answered correctly.
 * A day covered by a streak freeze keeps the chain alive but does not add to the count.
 * The current streak stays alive through today, so it only drops to 0 once a full day was missed.
 */
export function computeStreak(correctTimestamps: string[], now: number = Date.now(), frozenDays: string[] = []): StreakInfo {
  const solved = new Set(correctTimestamps.map((t) => istDay(t)));
  if (solved.size === 0) return { current: 0, best: 0 };
  const frozen = new Set(frozenDays);
  const covered = new Set<string>([...solved, ...frozen]);
  const days = Array.from(covered).sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    if (prev === null || d !== shiftDay(prev, 1)) run = 0;
    if (solved.has(d)) run++;
    if (run > best) best = run;
    prev = d;
  }

  const today = istDay(now);
  let cursor = covered.has(today) ? today : covered.has(shiftDay(today, -1)) ? shiftDay(today, -1) : null;
  let current = 0;
  while (cursor && covered.has(cursor)) {
    if (solved.has(cursor)) current++;
    cursor = shiftDay(cursor, -1);
  }
  return { current, best };
}
