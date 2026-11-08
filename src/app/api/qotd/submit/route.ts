import { db } from '@/lib/server/db';
import { fail, freshUser, handle, json, readBody, requireUser, str } from '@/lib/server/helpers';
import { buildState, getActiveQuestion, pointsFor } from '@/lib/server/qotd';
import { checkAnswer } from '@/lib/fuzzyMatch';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in to answer.', 401);

  const b = await readBody(req);
  const guess = str(b.guess, 300);
  if (!guess) return fail('Answer is empty. Please enter your answer or expected funda.');

  const q = await getActiveQuestion();
  if (!q) return fail('There is no active question right now.', 404);

  const already = await db()
    .from('submissions').select('id').eq('user_id', me.id).eq('question_id', q.id).maybeSingle();
  if (already.data) return fail('You have already attempted today\'s question.', 409, { state: await buildState(me.id) });

  const unlocks = await db().from('hint_unlocks').select('tier').eq('user_id', me.id).eq('question_id', q.id);
  const tiers = ((unlocks.data ?? []) as { tier: string }[]).map((r) => r.tier);

  const result = checkAnswer(guess, q.answer, q.funda ?? undefined, q.funda_keywords ?? []);
  const feedback = result.isMatch ? result.reason : 'Not quite. Your attempt for this question is now used.';

  const { error } = await db().rpc('submit_answer', {
    p_user_id: me.id,
    p_question_id: q.id,
    p_guess: guess,
    p_hints: tiers,
    p_points: pointsFor(tiers),
    p_correct: result.isMatch,
    p_score: Number(result.confidence.toFixed(2)),
    p_feedback: feedback,
  });

  if (error) {
    if (error.code === '23505') return fail('You have already attempted today\'s question.', 409, { state: await buildState(me.id) });
    throw error;
  }

  return json({ state: await buildState(me.id), user: await freshUser(me.id) });
});
