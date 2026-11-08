import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const DELETE = handle<{ params: Promise<{ id: string }> }>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const { error } = await db().from('profiles').delete().eq('id', id).eq('role', 'user');
  if (error) throw error;
  return json({ ok: true });
});
