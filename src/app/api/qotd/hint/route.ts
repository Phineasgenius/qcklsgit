import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, requireUser, str } from '@/lib/server/helpers';
import { buildState, getActiveQuestion, hintText, TIERS } from '@/lib/server/qotd';
import type { HintTier } from '@/types';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in to unlock clues.', 401);

  const b = await readBody(req);
  const tier = str(b.tier, 20) as HintTier;
  if (!TIERS.includes(tier)) return fail('Unknown clue.');

  const q = await getActiveQuestion();
  if (!q) return fail('There is no active question right now.', 404);
  if (!hintText(q, tier)) return fail('This clue does not exist for the question.');

  const existing = await db()
    .from('submissions').select('id').eq('user_id', me.id).eq('question_id', q.id).maybeSingle();
  if (existing.data) return fail('You have already attempted this question.', 409, { state: await buildState(me.id) });

  const { error } = await db()
    .from('hint_unlocks')
    .upsert({ user_id: me.id, question_id: q.id, tier }, { onConflict: 'user_id,question_id,tier', ignoreDuplicates: true });
  if (error) throw error;

  return json({ state: await buildState(me.id) });
});
