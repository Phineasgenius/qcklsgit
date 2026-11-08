import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, requireUser, str, toUser, ProfileRow } from '@/lib/server/helpers';
import { validateProfileFields } from '@/lib/options';

export const dynamic = 'force-dynamic';

export const PUT = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const year = str(b.year, 10);
  const branch = str(b.branch, 30);
  const designation = str(b.designation, 30);
  const err = validateProfileFields(year, branch, designation);
  if (err) return fail(err);

  const { data, error } = await db()
    .from('profiles')
    .update({ year, branch, designation })
    .eq('id', me.id)
    .select('*')
    .single();
  if (error) throw error;
  return json({ user: toUser(data as ProfileRow) });
});
