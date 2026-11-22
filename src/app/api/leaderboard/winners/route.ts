import { db } from '@/lib/server/db';
import { handle, json } from '@/lib/server/helpers';
import { lastWeekStart, shiftDay } from '@/lib/server/week';
import type { WeeklyWinnersWeek } from '@/types';

export const dynamic = 'force-dynamic';

interface WinnerRow {
  week_start: string;
  rank: number;
  user_id: string | null;
  name: string;
  uid: string;
  points: number;
  correct_count: number;
  wrong_count: number;
}

/** Top 3 of every finished week, newest first. Saves any finished week that was not saved yet. */
export const GET = handle(async () => {
  const snap = await db().rpc('snapshot_finished_weeks');
  if (snap.error) throw snap.error;

  const { data, error } = await db()
    .from('weekly_winners')
    .select('week_start, rank, user_id, name, uid, points, correct_count, wrong_count')
    .order('week_start', { ascending: false })
    .order('rank', { ascending: true })
    .limit(150);
  if (error) throw error;

  const byWeek = new Map<string, WeeklyWinnersWeek>();
  for (const r of (data ?? []) as WinnerRow[]) {
    let wk = byWeek.get(r.week_start);
    if (!wk) {
      wk = { weekStart: r.week_start, weekEnd: shiftDay(r.week_start, 6), winners: [] };
      byWeek.set(r.week_start, wk);
    }
    const gone = r.user_id === null; // account was deleted: keep the result, hide the identity
    wk.winners.push({
      rank: r.rank,
      name: gone ? 'Former member' : r.name,
      uid: gone ? '' : r.uid,
      points: r.points,
      correctCount: r.correct_count,
      wrongCount: r.wrong_count,
    });
  }

  return json({ weeks: [...byWeek.values()].slice(0, 50), lastWeekStart: lastWeekStart() });
});
