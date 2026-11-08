import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, str, ProfileRow } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const b = await readBody(req);
  const uid = str(b.uid, 32).toLowerCase();
  if (!uid) return fail('Please enter your college UID.');

  const { data } = await db().from('profiles').select('security_question').eq('uid', uid).eq('role', 'user').maybeSingle();
  const row = data as Pick<ProfileRow, 'security_question'> | null;

  if (!row?.security_question) {
    return fail('No security question is set for this UID. Please ask the Quizmaster to reset your password.', 404);
  }
  return json({ question: row.security_question });
});
