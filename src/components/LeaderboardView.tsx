'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { LeaderboardEntry, LeaderboardResponse } from '@/types';
import { Crown, Flame } from 'lucide-react';

type Sort = 'points' | 'cw';

function Streak({ n }: { n: number }) {
  if (n <= 0) return <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-mono font-black text-[var(--ink)]" title={`${n}-day streak`}>
      <Flame className="w-3.5 h-3.5 text-[var(--red)] fill-[var(--red)]" />
      {n}
    </span>
  );
}

function Podium({ p, place }: { p: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const medal = place === 1 ? 'var(--gold)' : place === 2 ? 'var(--silver)' : 'var(--bronze)';
  const first = place === 1;
  return (
    <div
      className={`card-neo card-neo-hover w-full ${first ? 'md:w-[290px] p-6 md:-translate-y-4 order-1 md:order-2' : `md:w-[260px] p-5 ${place === 2 ? 'order-2 md:order-1' : 'order-3'}`} flex flex-col items-center text-center relative bg-[var(--bg-secondary)]`}
    >
      <div
        className={`${first ? 'w-10 h-10 -top-5' : 'w-8 h-8 -top-4'} rounded-full border-[2px] border-[var(--ink)] font-black text-sm flex items-center justify-center absolute shadow-[2px_2px_0_var(--ink)] text-[#1b1712]`}
        style={{ background: medal }}
      >
        {first ? <Crown className="w-5 h-5 fill-[#1b1712] text-[#1b1712]" /> : place}
      </div>
      <div
        className={`${first ? 'w-20 h-20 text-3xl' : 'w-16 h-16 text-2xl'} rounded-xl border-[2.5px] bg-[var(--paper-deep)] flex items-center justify-center font-black my-2 text-[var(--ink)]`}
        style={{ borderColor: medal }}
      >
        {p.name.charAt(0)}
      </div>
      <h4 className={`font-extrabold ${first ? 'text-lg' : 'text-base'} text-[var(--ink)] truncate max-w-[220px]`}>{p.name}</h4>
      <span className="text-xs font-mono font-bold text-[var(--text-muted)]">{p.uid}</span>
      <div className={`font-mono ${first ? 'text-3xl' : 'text-2xl'} font-black text-[var(--ink)] my-2`}>{p.points} ★</div>
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--paper-deep)] border-[1.5px] border-[var(--ink)]">
        {p.cwRatio.toFixed(2)} CW ({p.correctCount}C / {p.wrongCount}W)
      </span>
      <div className="mt-2"><Streak n={p.streak} /></div>
    </div>
  );
}

function Row({ player, highlight }: { player: LeaderboardEntry; highlight: boolean }) {
  const rankBg = player.rank === 1 ? 'bg-[var(--gold)]' : player.rank === 2 ? 'bg-[var(--silver)]' : player.rank === 3 ? 'bg-[var(--bronze)]' : 'bg-[var(--bg-secondary)]';
  return (
    <div className={`grid grid-cols-12 items-center px-5 py-3.5 transition-colors ${highlight ? 'bg-[var(--yellow)]/25' : 'hover:bg-[var(--paper)]'}`}>
      <div className="col-span-2 sm:col-span-1">
        <span className={`min-w-7 h-7 px-1 rounded-lg border-[1.5px] border-[var(--ink)] font-mono font-black text-xs flex items-center justify-center shadow-[1px_1px_0_var(--ink)] w-fit ${rankBg} ${player.rank <= 3 ? 'text-[#1b1712]' : 'text-[var(--ink)]'}`}>
          #{player.rank}
        </span>
      </div>
      <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper-deep)] flex items-center justify-center text-xs font-black shrink-0 text-[var(--ink)]">
          {player.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-sm text-[var(--ink)] truncate">
            {player.name}
            {highlight && <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded bg-[var(--yellow)] text-[#1b1712] border border-[var(--ink)]">YOU</span>}
          </div>
          <div className="font-mono text-[11px] font-bold text-[var(--red)]">{player.uid}</div>
        </div>
      </div>
      <div className="hidden sm:block sm:col-span-2 text-center"><Streak n={player.streak} /></div>
      <div className="col-span-4 sm:col-span-2 text-right">
        <div className="font-mono font-black text-sm text-[var(--ink)]">{player.cwRatio.toFixed(2)} CW</div>
        <div className="text-[10px] font-mono font-bold text-[var(--text-muted)]">{player.correctCount}C / {player.wrongCount}W</div>
      </div>
      <div className="hidden sm:block sm:col-span-2 text-right">
        <span className="font-mono text-base font-black text-[var(--ink)]">{player.points}</span>
        <span className="font-mono text-xs font-bold text-[var(--ink)] ml-0.5">★</span>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [sortBy, setSortBy] = useState<Sort>('points');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await apiFetch<Partial<LeaderboardResponse>>(`/api/leaderboard?sort=${sortBy}`);
      if (cancelled) return;
      if (res.ok) {
        setData({ entries: res.data.entries ?? [], me: res.data.me ?? null, meId: res.data.meId ?? null, total: res.data.total ?? 0 });
        setLoadError('');
      } else {
        setLoadError(res.data.error ?? 'Could not load the leaderboard.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [sortBy]);

  const entries = data?.entries ?? [];
  const top = (rank: number) => entries.find((e) => e.rank === rank);

  return (
    <div className="space-y-8 animate-fadeIn">
      {entries.length >= 3 && (
        <div className="pt-2">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black tracking-tight text-[var(--ink)]">Top Quizzers Podium</h3>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-5 md:items-end">
            {top(2) && <Podium p={top(2)!} place={2} />}
            {top(1) && <Podium p={top(1)!} place={1} />}
            {top(3) && <Podium p={top(3)!} place={3} />}
          </div>
        </div>
      )}

      <div className="card-neo p-4 flex items-center justify-between gap-4 bg-[var(--bg-secondary)] flex-wrap">
        <div className="text-xs font-bold text-[var(--text-secondary)]">
          Top 10 of {data?.total ?? 0} {data?.total === 1 ? 'member' : 'members'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Sort by:</span>
          <div className="inline-flex rounded-full border-[2px] border-[var(--ink)] p-0.5 bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)]">
            {(['points', 'cw'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  sortBy === s ? 'bg-[var(--yellow)] text-[#1b1712] border-[1.5px] border-[var(--ink)] shadow-[1px_1px_0_var(--ink)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {s === 'points' ? 'Points ★' : 'CW Ratio'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-neo overflow-hidden bg-[var(--bg-secondary)]">
        <div className="grid grid-cols-12 px-5 py-3 border-b-[2.5px] border-[var(--ink)] bg-[var(--paper-deep)] text-xs font-black uppercase tracking-wider text-[var(--ink)]">
          <span className="col-span-2 sm:col-span-1">Rank</span>
          <span className="col-span-6 sm:col-span-5">Member</span>
          <span className="hidden sm:block sm:col-span-2 text-center">Streak</span>
          <span className="col-span-4 sm:col-span-2 text-right">CW</span>
          <span className="hidden sm:block sm:col-span-2 text-right">Points</span>
        </div>

        <div className="divide-y-[2px] divide-[var(--ink)]">
          {loading && !data ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--text-muted)]">Loading leaderboard…</div>
          ) : loadError ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--red)]">{loadError}</div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--text-muted)]">No participants on the leaderboard yet.</div>
          ) : (
            <>
              {entries.map((p) => (
                <Row key={p.id} player={p} highlight={p.id === data?.meId} />
              ))}
              {data?.me && (
                <>
                  <div className="py-1.5 text-center text-xs font-black tracking-widest text-[var(--text-muted)] bg-[var(--paper-deep)]">• • •</div>
                  <Row player={data.me} highlight />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
