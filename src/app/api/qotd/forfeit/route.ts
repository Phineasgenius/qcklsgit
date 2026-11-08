import { db } from '@/lib/server/db';
import { fail, freshUser, handle, json, requireUser } from '@/lib/server/helpers';
import { buildState, getActiveQuestion, maxAttemptsFor } from '@/lib/server/qotd';

export const dynamic = 'force-dynamic';

export const POST = handle(async () => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const q = await getActiveQuestion();
  if (!q) return fail('There is no active question right now.', 404);

  const unlocks = await db().from('hint_unlocks').select('tier').eq('user_id', me.id).eq('question_id', q.id);
  const tiers = ((unlocks.data ?? []) as { tier: string }[]).map((r) => r.tier);

  const { error } = await db().rpc('submit_answer', {
    p_user_id: me.id,
    p_question_id: q.id,
    p_guess: '[Forfeited]',
    p_hints: tiers,
    p_points: 0,
    p_correct: false,
    p_score: 0,
    p_feedback: 'Participant revealed the solution.',
    p_forfeit: true,
    p_max_attempts: maxAttemptsFor(q),
  });

  if (error) {
    if (/already_finished|no_attempts_left|23505/.test(`${error.message} ${error.code}`)) {
      return fail('You have already finished this question.', 409, { state: await buildState(me.id) });
    }
    throw error;
  }

  return json({ state: await buildState(me.id), user: await freshUser(me.id) });
});
