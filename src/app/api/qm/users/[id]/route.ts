import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { fail, handle, isQM, json, readBody } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const { error } = await db().from('profiles').delete().eq('id', id).eq('role', 'user');
  if (error) throw error;
  return json({ ok: true });
});

/** PATCH { password } = Quizmaster sets a temporary password for a member. */
export const PATCH = handle<Ctx>(async (req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const b = await readBody(req);
  const password = typeof b.password === 'string' ? b.password : '';
  if (password.length < 6) return fail('Password must be at least 6 characters.');
  if (password.length > 128) return fail('Password is too long.');

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await db()
    .from('profiles')
    .update({ password_hash, reset_fails: 0, reset_locked_until: null })
    .eq('id', id)
    .eq('role', 'user')
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) return fail('User not found.', 404);
  return json({ ok: true });
});
