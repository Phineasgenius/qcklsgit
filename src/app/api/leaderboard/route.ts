import { db } from '@/lib/server/db';
import { handle, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const { data, error } = await db()
    .from('profiles')
    .select('id, name, uid, points, correct_count, wrong_count')
    .eq('role', 'user')
    .order('points', { ascending: false })
    .order('correct_count', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;

  const entries = (data ?? []).map((p, idx) => ({
    id: p.id as string,
    name: p.name as string,
    uid: p.uid as string,
    points: p.points as number,
    correctCount: p.correct_count as number,
    wrongCount: p.wrong_count as number,
    cwRatio:
      p.wrong_count === 0 ? (p.correct_count as number) : Number(((p.correct_count as number) / (p.wrong_count as number)).toFixed(2)),
    rank: idx + 1,
  }));
  return json({ entries });
});
