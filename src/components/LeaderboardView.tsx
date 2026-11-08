'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { LeaderboardEntry } from '@/types';
import { 
  Trophy, 
  Search, 
  Crown
} from 'lucide-react';

export function LeaderboardView() {
  const [boardData, setBoardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'cw'>('points');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch<{ entries?: LeaderboardEntry[] }>('/api/leaderboard');
      if (cancelled) return;
      if (res.ok) setBoardData(res.data.entries ?? []);
      else setLoadError(res.data.error ?? 'Could not load the leaderboard.');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = boardData
    .filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'points') {
        if (b.points !== a.points) return b.points - a.points;
        return b.correctCount - a.correctCount;
      } else {
        if (b.cwRatio !== a.cwRatio) return b.cwRatio - a.cwRatio;
        return b.points - a.points;
      }
    });

  const top1 = boardData.find(u => u.rank === 1);
  const top2 = boardData.find(u => u.rank === 2);
  const top3 = boardData.find(u => u.rank === 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. TOP 3 PODIUM SECTION */}
      {boardData.length >= 3 && (
        <div className="pt-2">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black tracking-tight text-[var(--ink)]">
              Top Quizzers Podium
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-5 items-end">
            {/* 2nd Place (Silver) */}
            {top2 && (
              <div className="card-neo card-neo-hover w-full md:w-[260px] p-5 flex flex-col items-center text-center relative bg-[var(--bg-secondary)] order-2 md:order-1">
                <div className="w-8 h-8 rounded-full bg-[var(--silver)] border-[2px] border-[var(--ink)] font-black text-sm flex items-center justify-center absolute -top-4 shadow-[2px_2px_0_var(--ink)] text-[var(--ink)]">
                  2
                </div>
                <div className="w-16 h-16 rounded-xl border-[2.5px] border-[var(--silver)] bg-[var(--paper-deep)] flex items-center justify-center text-2xl font-black my-2 text-[var(--ink)]">
                  {top2.name.charAt(0)}
                </div>
                <h4 className="font-extrabold text-base text-[var(--ink)] truncate max-w-[200px]">
                  {top2.name}
                </h4>
                <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                  {top2.uid}
                </span>
                <div className="font-mono text-2xl font-black text-[var(--ink)] my-2">
                  {top2.points} ★
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--paper-deep)] border-[1.5px] border-[var(--ink)]">
                  {top2.cwRatio.toFixed(2)} CW ({top2.correctCount}C / {top2.wrongCount}W)
                </span>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {top1 && (
              <div className="card-neo card-neo-hover w-full md:w-[290px] p-6 flex flex-col items-center text-center relative bg-[var(--bg-secondary)] border-[3px] border-[var(--ink)] shadow-[10px_10px_0_var(--ink)] order-1 md:order-2 md:-translate-y-4">
                <div className="w-10 h-10 rounded-full bg-[var(--gold)] border-[2.5px] border-[var(--ink)] font-black text-base flex items-center justify-center absolute -top-5 shadow-[3px_3px_0_var(--ink)] text-[var(--ink)]">
                  <Crown className="w-5 h-5 fill-[var(--ink)] text-[var(--ink)]" />
                </div>
                <div className="w-20 h-20 rounded-xl border-[3px] border-[var(--gold)] bg-[var(--yellow)]/30 flex items-center justify-center text-3xl font-black my-2 text-[var(--ink)]">
                  {top1.name.charAt(0)}
                </div>
                <h4 className="font-extrabold text-lg text-[var(--ink)] truncate max-w-[220px]">
                  {top1.name}
                </h4>
                <span className="text-xs font-mono font-black text-[var(--red)]">
                  {top1.uid}
                </span>
                <div className="font-mono text-3xl font-black text-[var(--ink)] my-2">
                  {top1.points} ★
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                  {top1.cwRatio.toFixed(2)} CW Ratio ({top1.correctCount}C / {top1.wrongCount}W)
                </span>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {top3 && (
              <div className="card-neo card-neo-hover w-full md:w-[260px] p-5 flex flex-col items-center text-center relative bg-[var(--bg-secondary)] order-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bronze)] border-[2px] border-[var(--ink)] font-black text-sm flex items-center justify-center absolute -top-4 shadow-[2px_2px_0_var(--ink)] text-[var(--ink)]">
                  3
                </div>
                <div className="w-16 h-16 rounded-xl border-[2.5px] border-[var(--bronze)] bg-[var(--paper-deep)] flex items-center justify-center text-2xl font-black my-2 text-[var(--ink)]">
                  {top3.name.charAt(0)}
                </div>
                <h4 className="font-extrabold text-base text-[var(--ink)] truncate max-w-[200px]">
                  {top3.name}
                </h4>
                <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                  {top3.uid}
                </span>
                <div className="font-mono text-2xl font-black text-[var(--ink)] my-2">
                  {top3.points} ★
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--paper-deep)] border-[1.5px] border-[var(--ink)]">
                  {top3.cwRatio.toFixed(2)} CW ({top3.correctCount}C / {top3.wrongCount}W)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SEARCH & SORT TOOLBAR (NO PLACEHOLDERS) */}
      <div className="card-neo p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--bg-secondary)]">
        {/* Search */}
        <div className="w-full sm:w-80 space-y-1">
          <label className="text-[11px] font-extrabold uppercase text-[var(--text-secondary)]">
            Search by Name or College UID
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or UID..."
              className="w-full pl-10 pr-4 py-2 rounded-full border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-semibold focus:outline-none focus:shadow-[2px_2px_0_var(--ink)] placeholder:text-[var(--text-muted)] placeholder:font-normal"
            />
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Sort by:</span>
          <div className="inline-flex rounded-full border-[2px] border-[var(--ink)] p-0.5 bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)]">
            <button
              onClick={() => setSortBy('points')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                sortBy === 'points'
                  ? 'bg-[var(--yellow)] text-[var(--ink)] border-[1.5px] border-[var(--ink)] shadow-[1px_1px_0_var(--ink)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Points ★
            </button>
            <button
              onClick={() => setSortBy('cw')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                sortBy === 'cw'
                  ? 'bg-[var(--yellow)] text-[var(--ink)] border-[1.5px] border-[var(--ink)] shadow-[1px_1px_0_var(--ink)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              CW Ratio
            </button>
          </div>
        </div>
      </div>

      {/* 3. LEADERBOARD LIST / TABLE */}
      <div className="card-neo overflow-hidden bg-[var(--bg-secondary)]">
        {/* Table Head */}
        <div className="grid grid-cols-12 px-5 py-3 border-b-[2.5px] border-[var(--ink)] bg-[var(--paper-deep)] text-xs font-black uppercase tracking-wider text-[var(--ink)]">
          <span className="col-span-2 sm:col-span-1">Rank</span>
          <span className="col-span-6 sm:col-span-6">Member & College UID</span>
          <span className="col-span-4 sm:col-span-3 text-right">CW (Correct/Wrong)</span>
          <span className="hidden sm:block sm:col-span-2 text-right">Points</span>
        </div>

        {/* Table Body */}
        <div className="divide-y-[2px] divide-[var(--ink)]">
          {loading ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--text-muted)]">Loading leaderboard…</div>
          ) : loadError ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--red)]">{loadError}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center text-xs font-bold text-[var(--text-muted)]">
              {searchQuery ? `No participants found matching "${searchQuery}".` : 'No participants on the leaderboard yet.'}
            </div>
          ) : (
            filteredUsers.map((player) => (
              <div
                key={player.id}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-[var(--paper)] transition-colors"
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1">
                  <span className={`w-7 h-7 rounded-lg border-[1.5px] border-[var(--ink)] font-mono font-black text-xs flex items-center justify-center shadow-[1px_1px_0_var(--ink)] ${
                    player.rank === 1 ? 'bg-[var(--gold)]' : player.rank === 2 ? 'bg-[var(--silver)]' : player.rank === 3 ? 'bg-[var(--bronze)]' : 'bg-[var(--bg-secondary)]'
                  }`}>
                    #{player.rank}
                  </span>
                </div>

                {/* Name & UID */}
                <div className="col-span-6 sm:col-span-6 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--paper-deep)] flex items-center justify-center text-xs font-black shrink-0 text-[var(--ink)]">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[var(--ink)] truncate">
                      {player.name}
                    </div>
                    <div className="font-mono text-[11px] font-bold text-[var(--red)]">
                      {player.uid}
                    </div>
                  </div>
                </div>

                {/* CW Ratio */}
                <div className="col-span-4 sm:col-span-3 text-right">
                  <div className="font-mono font-black text-sm text-[var(--ink)]">
                    {player.cwRatio.toFixed(2)} CW
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                    {player.correctCount}C / {player.wrongCount}W
                  </div>
                </div>

                {/* Points */}
                <div className="hidden sm:block sm:col-span-2 text-right">
                  <span className="font-mono text-base font-black text-[var(--ink)]">
                    {player.points}
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--ink)] ml-0.5">★</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
