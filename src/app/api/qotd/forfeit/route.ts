import { db } from '@/lib/server/db';
import { fail, freshUser, handle, json, readBody, requireUser } from '@/lib/server/helpers';
import { buildState, getActiveQuestion, maxAttemptsFor, partsOf } from '@/lib/server/qotd';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const q = await getActiveQuestion();
  if (!q) return fail('There is no active question right now.', 404);

  if (typeof b.questionId === 'string' && b.questionId && b.questionId !== q.id) {
    return fail('A new question has just gone live. Please read it before continuing.', 409, { state: await buildState(me.id) });
  }

  const unlocks = await db().from('hint_unlocks').select('tier').eq('user_id', me.id).eq('question_id', q.id);
  const tiers = ((unlocks.data ?? []) as { tier: string }[]).map((r) => r.tier);

  const { error } = await db().rpc('submit_answer', {
    p_user_id: me.id,
    p_question_id: q.id,
    p_guess: '[Forfeited]',
    p_hints: tiers,
    p_parts: [],
    p_total_parts: partsOf(q).length,
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