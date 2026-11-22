import { fail, freshUser, handle, json, requireUser } from '@/lib/server/helpers';
import { applyFreezes, awardCoins } from '@/lib/server/coins';
import { istDay } from '@/lib/server/streak';
import { DAILY_COINS } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/**
 * Called when a signed-in member opens the site.
 * 1) a streak freeze covers any missed days (if they own enough), 2) the daily coins are paid once per IST day.
 */
export const POST = handle(async () => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const freezesUsed = await applyFreezes(me.id);
  const claimed = await awardCoins(me.id, DAILY_COINS, 'daily', istDay(Date.now()));

  return json({ claimed, freezesUsed, user: await freshUser(me.id) });
});
