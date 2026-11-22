import { istDay } from './streak';

const DAY_MS = 24 * 3600 * 1000;

export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

/** The Monday (YYYY-MM-DD) of the week that contains an IST calendar day. Weeks run Monday to Sunday. */
export function weekStartOf(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const sinceMonday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return shiftDay(day, -sinceMonday);
}

export function currentWeekStart(now: number = Date.now()): string {
  return weekStartOf(istDay(now));
}

export function lastWeekStart(now: number = Date.now()): string {
  return shiftDay(currentWeekStart(now), -7);
}

/** Exact instants for a week: Monday 00:00 IST up to (not including) the next Monday 00:00 IST. */
export function weekBounds(weekStart: string): { startIso: string; endIso: string; weekEnd: string } {
  const start = new Date(`${weekStart}T00:00:00+05:30`);
  return {
    startIso: start.toISOString(),
    endIso: new Date(start.getTime() + 7 * DAY_MS).toISOString(),
    weekEnd: shiftDay(weekStart, 6), // Sunday
  };
}
