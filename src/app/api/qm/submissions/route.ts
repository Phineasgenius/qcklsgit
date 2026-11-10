import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { data, error } = await db()
    .from('submissions')
    .select(
      'id, guess, is_correct, is_forfeit, is_overridden, attempt_no, hints_unlocked, points_awarded, created_at, profiles(name, uid), questions(edition)'
    )
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;

  const order = ['difficult', 'medium', 'easy'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submissions = ((data ?? []) as any[]).map((s) => {
    const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    const q = Array.isArray(s.questions) ? s.questions[0] : s.questions;
    const hints = ((s.hints_unlocked ?? []) as string[]).filter((h) => order.includes(h));
    hints.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return {
      id: s.id,
      userName: p?.name ?? 'Deleted user',
      userUid: p?.uid ?? '-',
      edition: q?.edition ?? null,
      guess: s.guess,
      isCorrect: s.is_correct,
      forfeited: Boolean(s.is_forfeit),
      overridden: Boolean(s.is_overridden),
      attemptNo: s.attempt_no ?? 1,
      hintsUsed: hints,
      pointsAwarded: s.points_awarded,
      timestamp: s.created_at,
    };
  });
  return json({ submissions });
});