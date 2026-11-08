import { db } from '@/lib/server/db';
import { clearSession } from '@/lib/server/session';
import { fail, handle, json, requireUser } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const DELETE = handle(async () => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);
  const { error } = await db().from('profiles').delete().eq('id', me.id);
  if (error) throw error;
  await clearSession();
  return json({ ok: true });
});
