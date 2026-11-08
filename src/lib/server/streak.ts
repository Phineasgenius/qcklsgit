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
 * The current streak stays alive through today, so it only drops to 0 once a full day was missed.
 */
export function computeStreak(correctTimestamps: string[], now: number = Date.now()): StreakInfo {
  const days = Array.from(new Set(correctTimestamps.map((t) => istDay(t)))).sort();
  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === shiftDay(days[i - 1], 1) ? run + 1 : 1;
    if (run > best) best = run;
  }

  const set = new Set(days);
  const today = istDay(now);
  let cursor = set.has(today) ? today : set.has(shiftDay(today, -1)) ? shiftDay(today, -1) : null;
  let current = 0;
  while (cursor && set.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  return { current, best };
}
