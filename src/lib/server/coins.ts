import { db } from './db';
import { istDay } from './streak';

/** Uses streak freezes for missed days if the member owns enough to cover all of them. Returns days covered. */
export async function applyFreezes(userId: string): Promise<number> {
  const { data, error } = await db().rpc('apply_freezes', { p_user_id: userId, p_today: istDay(Date.now()) });
  if (error) {
    console.error('[apply_freezes]', error);
    return 0;
  }
  return Number(data ?? 0);
}

/** Pays coins once per (member, reason, ref). Returns true only if they were paid just now. */
export async function awardCoins(userId: string, amount: number, reason: string, ref: string): Promise<boolean> {
  const { data, error } = await db().rpc('award_coins', { p_user_id: userId, p_amount: amount, p_reason: reason, p_ref: ref });
  if (error) {
    console.error('[award_coins]', error);
    return false;
  }
  return data === true;
}
