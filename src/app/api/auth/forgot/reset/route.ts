import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, str, ProfileRow } from '@/lib/server/helpers';
import { normalizeSecurityAnswer } from '@/lib/options';

export const dynamic = 'force-dynamic';

const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.1tKQ1u0Xo0c7kYzC1t8mZ5n3xk5e';
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

export const POST = handle(async (req) => {
  const b = await readBody(req);
  const uid = str(b.uid, 32).toLowerCase();
  const answer = str(b.answer, 100);
  const newPassword = typeof b.newPassword === 'string' ? b.newPassword : '';

  if (!uid || !answer) return fail('Please enter your UID and your answer.');
  if (newPassword.length < 6) return fail('New password must be at least 6 characters.');
  if (newPassword.length > 128) return fail('Password is too long.');

  const { data } = await db().from('profiles').select('*').eq('uid', uid).eq('role', 'user').maybeSingle();
  const row = data as ProfileRow | null;

  if (row?.reset_locked_until && new Date(row.reset_locked_until).getTime() > Date.now()) {
    return fail(`Too many wrong answers. Try again in ${LOCK_MINUTES} minutes, or ask the Quizmaster to reset your password.`, 429);
  }

  if (!row || !row.security_answer_hash) {
    await bcrypt.compare(answer, DUMMY_HASH);
    return fail('Could not verify your answer. Ask the Quizmaster to reset your password.', 400);
  }

  const ok = await bcrypt.compare(normalizeSecurityAnswer(answer), row.security_answer_hash);
  if (!ok) {
    const fails = (row.reset_fails ?? 0) + 1;
    const lock = fails >= MAX_FAILS;
    await db()
      .from('profiles')
      .update({
        reset_fails: lock ? 0 : fails,
        reset_locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
      })
      .eq('id', row.id);
    return fail(
      lock
        ? `Too many wrong answers. Locked for ${LOCK_MINUTES} minutes.`
        : `Incorrect answer. ${MAX_FAILS - fails} ${MAX_FAILS - fails === 1 ? 'try' : 'tries'} left.`,
      401
    );
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error } = await db()
    .from('profiles')
    .update({ password_hash, reset_fails: 0, reset_locked_until: null })
    .eq('id', row.id);
  if (error) throw error;

  return json({ message: 'Password updated. You can now sign in with your new password.' });
});
