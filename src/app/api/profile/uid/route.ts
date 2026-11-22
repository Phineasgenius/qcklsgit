import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, requireUser, str, toUser, ProfileRow, UID_CHANGE_DAYS } from '@/lib/server/helpers';
import { validateUid } from '@/lib/options';

export const dynamic = 'force-dynamic';

const TAKEN = 'This UID is already registered to another member.';

export const PUT = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const uid = str(b.uid, 32).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';

  const uidErr = validateUid(uid);
  if (uidErr) return fail(uidErr);

  const reserved = (process.env.QM_USERNAME || '').toLowerCase();
  if (uid === 'phineas' || (reserved && uid === reserved)) return fail('This UID is reserved for the Quizmaster.');
  if (uid === me.uid.toLowerCase()) return fail('That is already your UID.');

  if (!password || !(await bcrypt.compare(password, me.password_hash))) {
    return fail('Your password is incorrect.', 401);
  }

  // Friendly early check; the unique index below is what truly guarantees no duplicates.
  const clash = await db().from('profiles').select('id').eq('uid', uid).neq('id', me.id).maybeSingle();
  if (clash.data) return fail(TAKEN, 409);

  // Atomic: only updates when the member has never changed it, or last changed it over a year ago.
  const cutoff = new Date(Date.now() - UID_CHANGE_DAYS * 86400000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const { data, error } = await db()
    .from('profiles')
    .update({ uid, uid_changed_at: new Date().toISOString() })
    .eq('id', me.id)
    .or(`uid_changed_at.is.null,uid_changed_at.lt.${cutoff}`)
    .select('*')
    .maybeSingle();

  if (error) {
    if (error.code === '23505') return fail(TAKEN, 409);
    throw error;
  }
  if (!data) {
    const next = me.uid_changed_at
      ? new Date(new Date(me.uid_changed_at).getTime() + UID_CHANGE_DAYS * 86400000).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
        })
      : null;
    return fail(`You can change your UID only once a year${next ? `. You can change it again on ${next}` : ''}.`, 403);
  }

  return json({ user: toUser(data as ProfileRow), message: `Your UID is now ${uid}.` });
});
