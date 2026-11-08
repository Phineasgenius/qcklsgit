import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, requireUser } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const PUT = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const current = typeof b.currentPassword === 'string' ? b.currentPassword : '';
  const next = typeof b.newPassword === 'string' ? b.newPassword : '';

  if (!current) return fail('Please enter your current password.');
  if (next.length < 6) return fail('New password must be at least 6 characters.');
  if (next.length > 128) return fail('Password is too long.');

  if (!(await bcrypt.compare(current, me.password_hash))) return fail('Current password is incorrect.', 401);

  const password_hash = await bcrypt.hash(next, 10);
  const { error } = await db().from('profiles').update({ password_hash }).eq('id', me.id);
  if (error) throw error;
  return json({ message: 'Password changed.' });
});
