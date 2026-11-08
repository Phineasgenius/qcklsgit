import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { data, error } = await db()
    .from('profiles')
    .select('id, name, uid, points, correct_count, wrong_count, year, branch, designation, created_at')
    .eq('role', 'user')
    .order('points', { ascending: false });
  if (error) throw error;
  const users = (data ?? []).map((p) => ({
    id: p.id, name: p.name, uid: p.uid, points: p.points,
    correctCount: p.correct_count, wrongCount: p.wrong_count,
    year: p.year, branch: p.branch, designation: p.designation, createdAt: p.created_at,
  }));
  return json({ users });
});
