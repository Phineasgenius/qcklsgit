import { getSession } from '@/lib/server/session';
import { handle, json } from '@/lib/server/helpers';
import { buildState } from '@/lib/server/qotd';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const s = await getSession();
  return json({ state: await buildState(s && s.role === 'user' ? s.sub : null) });
});
