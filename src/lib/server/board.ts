import { db } from './db';
import { computeStreak } from './streak';
import { currentWeekStart, weekBounds } from './week';
import type { LeaderboardEntry, StreakInfo } from '@/types';

/**
 * Every member, ranked by points. Ties go to the higher CW ratio, then more correct answers,
 * then the earlier sign-up. (Streak is filled in separately for the few rows we show.)
 */
export async function loadRanked(): Promise<LeaderboardEntry[]> {
  const { data, error } = await db()
    .from('profiles')
    .select('id, name, uid, points, correct_count, wrong_count, created_at')
    .eq('role', 'user')
    .range(0, 4999);
  if (error) throw error;

  const rows = (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    uid: p.uid as string,
    points: p.points as number,
    correctCount: p.correct_count as number,
    wrongCount: p.wrong_count as number,
    createdAt: p.created_at as string,
    cwRatio:
      p.wrong_count === 0 ? (p.correct_count as number) : Number(((p.correct_count as number) / (p.wrong_count as number)).toFixed(2)),
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.cwRatio !== a.cwRatio) return b.cwRatio - a.cwRatio;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return rows.map((r, i) => ({
    id: r.id,
    name: r.name,
    uid: r.uid,
    points: r.points,
    correctCount: r.correctCount,
    wrongCount: r.wrongCount,
    cwRatio: r.cwRatio,
    rank: i + 1,
    streak: 0,
  }));
}

export async function streaksFor(ids: string[]): Promise<Map<string, StreakInfo>> {
  const out = new Map<string, StreakInfo>();
  if (ids.length === 0) return out;
  const { data, error } = await db()
    .from('submissions')
    .select('user_id, created_at')
    .in('user_id', ids)
    .eq('is_correct', true)
    .range(0, 49999);
  if (error) throw error;

  const byUser = new Map<string, string[]>();
  for (const r of (data ?? []) as { user_id: string; created_at: string }[]) {
    const list = byUser.get(r.user_id) ?? [];
    list.push(r.created_at);
    byUser.set(r.user_id, list);
  }
  // Days covered by streak freezes (ignored if the table is not there yet).
  const frozenBy = new Map<string, string[]>();
  const fz = await db().from('streak_freezes_used').select('user_id, day').in('user_id', ids);
  for (const r of (fz.data ?? []) as { user_id: string; day: string }[]) {
    const list = frozenBy.get(r.user_id) ?? [];
    list.push(r.day);
    frozenBy.set(r.user_id, list);
  }

  for (const id of ids) out.set(id, computeStreak(byUser.get(id) ?? [], Date.now(), frozenBy.get(id) ?? []));
  return out;
}

interface WeeklyRow {
  rank_no: number | string;
  user_id: string;
  user_name: string;
  user_uid: string;
  points: number | string;
  correct_count: number | string;
  wrong_count: number | string;
}

/** This week's ranking (Monday to Sunday, IST). Only members who played this week appear. */
export async function loadWeekly(): Promise<{ entries: LeaderboardEntry[]; week: { start: string; end: string } }> {
  const start = currentWeekStart();
  const { startIso, endIso, weekEnd } = weekBounds(start);
  const { data, error } = await db().rpc('weekly_board', { p_start: startIso, p_end: endIso });
  if (error) throw error;

  const entries = ((data ?? []) as WeeklyRow[]).map<LeaderboardEntry>((r) => {
    const correct = Number(r.correct_count);
    const wrong = Number(r.wrong_count);
    return {
      id: r.user_id,
      name: r.user_name,
      uid: r.user_uid,
      points: Number(r.points),
      correctCount: correct,
      wrongCount: wrong,
      cwRatio: wrong === 0 ? correct : Number((correct / wrong).toFixed(2)),
      rank: Number(r.rank_no),
      streak: 0,
    };
  });
  return { entries, week: { start, end: weekEnd } };
}
