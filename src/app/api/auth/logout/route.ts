import { clearSession } from '@/lib/server/session';
import { handle, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const POST = handle(async () => {
  await clearSession();
  return json({ ok: true });
});
