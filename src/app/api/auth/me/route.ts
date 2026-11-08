import { currentUser, handle, json } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  return json({ user: await currentUser() });
});
