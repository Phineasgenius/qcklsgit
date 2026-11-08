import { getSession } from '@/lib/server/session';
import { handle, json } from '@/lib/server/helpers';
import { loadRanked, streaksFor, SortMode } from '@/lib/server/board';
import type { LeaderboardResponse } from '@/types';

export const dynamic = 'force-dynamic';

const TOP = 10;

export const GET = handle(async (req) => {
  const sort: SortMode = new URL(req.url).searchParams.get('sort') === 'cw' ? 'cw' : 'points';
  const ranked = await loadRanked(sort);
  const session = await getSession();
  const meId = session && session.role === 'user' ? session.sub : null;

  const top = ranked.slice(0, TOP);
  const mine = meId ? ranked.find((r) => r.id === meId) ?? null : null;
  const meOutside = mine && mine.rank > TOP ? mine : null;

  const streaks = await streaksFor([...top.map((t) => t.id), ...(meOutside ? [meOutside.id] : [])]);
  const withStreak = (e: (typeof ranked)[number]) => ({ ...e, streak: streaks.get(e.id)?.current ?? 0 });

  const body: LeaderboardResponse = {
    entries: top.map(withStreak),
    me: meOutside ? withStreak(meOutside) : null,
    meId,
    total: ranked.length,
  };
  return json(body);
});
