import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { data, error } = await db()
    .from('submissions')
    .select('id, guess, is_correct, points_awarded, created_at, profiles(name, uid), questions(edition)')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions = ((data ?? []) as any[]).map((s) => {
    const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const q = Array.isArray(s.questions) ? s.questions[0] : s.questions;
    return {
      id: s.id,
      userName: p?.name ?? 'Deleted user',
      userUid: p?.uid ?? '-',
      edition: q?.edition ?? null,
      guess: s.guess,
      isCorrect: s.is_correct,
      pointsAwarded: s.points_awarded,
      timestamp: s.created_at,
    };
  });
  return json({ submissions });
});
