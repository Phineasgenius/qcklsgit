import { db } from '@/lib/server/db';
import { fail, handle, isQM, json, readBody } from '@/lib/server/helpers';
import { pointsFor } from '@/lib/server/qotd';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Quizmaster manually marks one submission correct or wrong. */
export const PATCH = handle<Ctx>(async (req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);

  const { id } = await params;
  const b = await readBody(req);
  if (typeof b.isCorrect !== 'boolean') return fail('Say whether to mark the answer correct or wrong.');
  const isCorrect = b.isCorrect;

  const { data: sub, error: readErr } = await db()
    .from('submissions')
    .select('id, is_correct, is_forfeit, hints_unlocked')
    .eq('id', id)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!sub) return fail('Submission not found.', 404);
  if (sub.is_forfeit) return fail('A forfeited attempt cannot be edited.');
  if (sub.is_correct === isCorrect) return fail(`This submission is already marked ${isCorrect ? 'correct' : 'wrong'}.`, 409);

  // Points follow the hints this user actually unlocked for this submission.
  const points = isCorrect ? pointsFor((sub.hints_unlocked ?? []) as string[]) : 0;

  const { error } = await db().rpc('qm_set_submission_result', {
    p_submission_id: id,
    p_correct: isCorrect,
    p_points: points,
  });

  if (error) {
    const msg = `${error.message} ${error.code}`;
    if (/already_has_correct|23505/.test(msg)) {
      return fail('This member already has a correct answer for this question.', 409);
    }
    if (/is_forfeit/.test(msg)) return fail('A forfeited attempt cannot be edited.');
    if (/submission_not_found/.test(msg)) return fail('Submission not found.', 404);
    throw error;
  }

  return json({ ok: true, isCorrect, pointsAwarded: points });
});