import { db } from './db';
import { computeStreak } from './streak';
import type { LeaderboardEntry, StreakInfo } from '@/types';

export type SortMode = 'points' | 'cw';

/** Every member, ranked. (Streak is filled in separately for the few rows we show.) */
export async function loadRanked(sort: SortMode = 'points'): Promise<LeaderboardEntry[]> {
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
    if (sort === 'cw') {
      if (b.cwRatio !== a.cwRatio) return b.cwRatio - a.cwRatio;
      if (b.points !== a.points) return b.points - a.points;
    } else {
      if (b.points !== a.points) return b.points - a.points;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    }
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
  for (const id of ids) out.set(id, computeStreak(byUser.get(id) ?? []));
  return out;
}
