import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { createSession } from '@/lib/server/session';
import { fail, handle, json, readBody, str, toUser, ProfileRow } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

// A valid bcrypt hash used to keep timing similar when the UID does not exist.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.1tKQ1u0Xo0c7kYzC1t8mZ5n3xk5e';

export const POST = handle(async (req) => {
  const b = await readBody(req);
  const uid = str(b.uid, 32).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';

  if (!uid || !password) return fail('Please provide both college UID and password.');

  const { data } = await db().from('profiles').select('*').eq('uid', uid).eq('role', 'user').maybeSingle();
  const row = data as ProfileRow | null;
  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);

  if (!row || !ok) {
    return fail('Incorrect UID or password. New here? Switch to "Sign Up".', 401);
  }

  await createSession(row.id, 'user');
  return json({ user: toUser(row), message: `Welcome back, ${row.name}!` });
});
