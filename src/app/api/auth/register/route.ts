import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { createSession } from '@/lib/server/session';
import { fail, handle, json, readBody, str, toUser, ProfileRow } from '@/lib/server/helpers';
import { normalizeSecurityAnswer, validateProfileFields, validateSecurity } from '@/lib/options';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const b = await readBody(req);
  const name = str(b.name, 80);
  const uid = str(b.uid, 32).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const year = str(b.year, 10);
  const branch = str(b.branch, 30);
  const designation = str(b.designation, 30);
  const securityQuestion = str(b.securityQuestion, 200);
  const securityAnswer = str(b.securityAnswer, 100);

  if (name.length < 2) return fail('Please enter your full real name.');
  if (!/^[a-z0-9._-]{4,32}$/.test(uid)) return fail('Please enter a valid college UID (e.g. 25u0101 as on your ID card).');
  if (password.length < 6) return fail('Password must be at least 6 characters.');
  if (password.length > 128) return fail('Password is too long.');
  const profileErr = validateProfileFields(year, branch, designation);
  if (profileErr) return fail(profileErr);
  const secErr = validateSecurity(securityQuestion, securityAnswer);
  if (secErr) return fail(secErr);

  const reserved = (process.env.QM_USERNAME || '').toLowerCase();
  if (uid === 'phineas' || (reserved && uid === reserved)) return fail('This UID is reserved for the Quizmaster.');

  const [password_hash, security_answer_hash] = await Promise.all([
    bcrypt.hash(password, 10),
    bcrypt.hash(normalizeSecurityAnswer(securityAnswer), 10),
  ]);

  const { data, error } = await db()
    .from('profiles')
    .insert({
      name, uid, role: 'user', password_hash, year, branch, designation,
      security_question: securityQuestion, security_answer_hash,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') return fail('This college UID is already registered. Please sign in.', 409);
    throw error;
  }

  const row = data as ProfileRow;
  await createSession(row.id, 'user');
  return json({ user: toUser(row), message: `Registration successful! Welcome to Quiz Club KLS GIT, ${row.name}!` });
});
