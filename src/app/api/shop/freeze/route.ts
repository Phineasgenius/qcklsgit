import { db } from '@/lib/server/db';
import { fail, freshUser, handle, json, readBody, requireUser } from '@/lib/server/helpers';
import { applyFreezes } from '@/lib/server/coins';
import { freezePrice, MAX_FREEZES } from '@/lib/shop';

export const dynamic = 'force-dynamic';

/** Buy 1 or 2 streak freezes with coins. A member can hold at most MAX_FREEZES. */
export const POST = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const quantity = Number(b.quantity);
  if (quantity !== 1 && quantity !== 2) return fail('Choose 1 or 2 streak freezes.');

  const { error } = await db().rpc('buy_streak_freezes', {
    p_user_id: me.id,
    p_qty: quantity,
    p_price: freezePrice(quantity),
    p_max: MAX_FREEZES,
  });
  if (error) {
    const msg = `${error.message}`;
    if (/freeze_limit/.test(msg)) return fail(`You can hold at most ${MAX_FREEZES} streak freezes.`, 409);
    if (/not_enough_coins/.test(msg)) return fail('You do not have enough coins for that.', 409);
    throw error;
  }

  // A freeze bought today can still rescue a streak if you missed yesterday and have not answered yet.
  const rescued = await applyFreezes(me.id);

  return json({
    user: await freshUser(me.id),
    rescued,
    message:
      rescued > 0
        ? `Bought! It covered ${rescued === 1 ? 'the day you missed' : `${rescued} missed days`} and saved your streak.`
        : `Bought ${quantity} streak ${quantity === 1 ? 'freeze' : 'freezes'}. It is used automatically if you miss a day.`,
  });
});
