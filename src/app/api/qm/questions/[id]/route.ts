import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH = make this question the active Question of the Day. */
export const PATCH = handle<Ctx>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const { error } = await db().rpc('activate_question', { p_id: id });
  if (error) {
    if (/not found/i.test(error.message)) return fail('Question not found.', 404);
    throw error;
  }
  return json({ ok: true });
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const q = await db().from('questions').select('status').eq('id', id).maybeSingle();
  if (!q.data) return fail('Question not found.', 404);
  if (q.data.status === 'active') return fail('This is the live question. Make another question active before deleting it.');
  const { error } = await db().from('questions').delete().eq('id', id);
  if (error) throw error;
  return json({ ok: true });
});
