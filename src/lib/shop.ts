// Coins and streak freezes. Shared by the server and the browser.

/** Coins for showing up (opening the site while signed in) once per IST day. */
export const DAILY_COINS = 5;

export const MAX_FREEZES = 2;
export const FREEZE_PRICE_ONE = 900;
export const FREEZE_PRICE_TWO = 1500;

export function freezePrice(quantity: 1 | 2): number {
  return quantity === 1 ? FREEZE_PRICE_ONE : FREEZE_PRICE_TWO;
}

/**
 * Bonus coins for reaching a streak length: 10 days -> 10, 50 days -> 50,
 * and every 100th day (100, 200, ... 1000, ...) -> as many coins as days.
 */
export function streakBonus(days: number): number {
  if (days === 10 || days === 50) return days;
  if (days >= 100 && days % 100 === 0) return days;
  return 0;
}
