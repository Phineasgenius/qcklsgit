'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { LeaderboardEntry, LeaderboardResponse, WeeklyWinnersWeek, WinnersResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Crown, Flame, Search, X } from 'lucide-react';
import { WeeklyWinnersToast, fmtWeekRange } from './WeeklyWinnersToast';
import styles from './LeaderboardView.module.css';

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : '3rd');

function PodiumCard({ user, rank }: { user: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const medal = rank === 1 ? styles.goldMedal : rank === 2 ? styles.silverMedal : styles.bronzeMedal;
  return (
    <div className={`${styles.podiumCard} ${medal} ${rank === 1 ? styles.podiumCardFirst : ''}`}>
      <div className={styles.podiumBadge}>{ordinal(rank)}</div>

      <div className={styles.podiumUserInfo}>
        <h3 className={styles.podiumName}>{user.name}</h3>
        <span className={styles.podiumUid}>{user.uid}</span>
      </div>

      <div className={styles.podiumScoreContainer}>
        <span className={styles.podiumScoreVal}>{user.points}</span>
        <span className={styles.podiumScoreLabel}>Weekly points</span>
      </div>

      <div className={styles.podiumStats}>
        <div className={styles.podiumStat}>
          <span className={styles.statDot} style={{ background: 'var(--teal)' }} />
          <span>{user.correctCount} C</span>
        </div>
        <div className={styles.podiumStat}>
          <span className={styles.statDot} style={{ background: 'var(--red)' }} />
          <span>{user.wrongCount} W</span>
        </div>
      </div>

      {user.streak > 0 && (
        <div className={styles.podiumStreak}>
          <Flame size={13} style={{ color: 'var(--red)', fill: 'var(--red)' }} />
          <span>Streak: <strong>{user.streak}</strong> {user.streak === 1 ? 'day' : 'days'}</span>
        </div>
      )}
    </div>
  );
}

function TableRow({ player, isMe }: { player: LeaderboardEntry; isMe: boolean }) {
  const rankCls = player.rank === 1 ? styles.rank1 : player.rank === 2 ? styles.rank2 : player.rank === 3 ? styles.rank3 : '';
  return (
    <tr className={`${styles.tableRow} ${isMe ? styles.meRow : ''}`}>
      <td className={styles.rankCell}>
        <span className={`${styles.rankNumber} ${rankCls}`}>{player.rank}</span>
      </td>
      <td>
        <div className={styles.userNameBlock}>
          <div className={styles.userDisplayName}>
            <span className={styles.nameText}>{player.name}</span>
            {isMe && <span className={styles.youTag}>YOU</span>}
          </div>
          <div className={styles.userUid}>{player.uid}</div>
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={styles.scoreHighlight}>{player.points}</span>
      </td>
      <td>
        <div className={styles.pills}>
          <span className={`${styles.pill} ${styles.correctPill}`}>{player.correctCount} C</span>
          <span className={`${styles.pill} ${styles.wrongPill}`}>{player.wrongCount} W</span>
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        {player.streak > 0 ? (
          <span className={styles.streakCell} title={`${player.streak}-day streak`}>
            <Flame size={16} style={{ color: 'var(--red)', fill: 'var(--red)' }} />
            {player.streak}
          </span>
        ) : (
          <span className={styles.textMuted}>—</span>
        )}
      </td>
    </tr>
  );
}

function BoardPanel() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // wait for a short pause in typing before asking the server
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const q = debounced ? `?q=${encodeURIComponent(debounced)}` : '';
      const res = await apiFetch<Partial<LeaderboardResponse>>(`/api/leaderboard${q}`);
      if (cancelled) return;
      if (res.ok) {
        setData({
          entries: res.data.entries ?? [],
          me: res.data.me ?? null,
          meId: res.data.meId ?? null,
          total: res.data.total ?? 0,
          query: res.data.query,
          week: res.data.week,
        });
        setLoadError('');
      } else {
        setLoadError(res.data.error ?? 'Could not load the leaderboard.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const entries = data?.entries ?? [];
  const searching = Boolean(data?.query);
  const byRank = (r: number) => entries.find((e) => e.rank === r);
  const podium: { user: LeaderboardEntry; rank: 1 | 2 | 3 }[] = [];
  if (byRank(2)) podium.push({ user: byRank(2)!, rank: 2 });
  if (byRank(1)) podium.push({ user: byRank(1)!, rank: 1 });
  if (byRank(3)) podium.push({ user: byRank(3)!, rank: 3 });

  return (
    <div className={styles.wrapper}>
      {data?.week && (
        <div className="mb-6 p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)] text-center text-xs font-bold text-[var(--ink)]">
          {fmtWeekRange(data.week.start, data.week.end)} • resets every Monday 12:00 am IST • your streak never resets
        </div>
      )}

      {/* Podium: shown for the top 10 view */}
      {!searching && podium.length > 0 && (
        <section className={styles.podiumSection}>
          <h3 className={styles.podiumTitle}>This Week&apos;s Top Quizzers</h3>
          <div className={styles.podiumContainer}>
            {podium.map(({ user, rank }) => (
              <PodiumCard key={user.id} user={user} rank={rank} />
            ))}
          </div>
        </section>
      )}

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any member by name or UID..."
            className={styles.searchInput}
            aria-label="Search members"
          />
          {search && (
            <button onClick={() => setSearch('')} className={styles.clearSearch} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.resultNote}>
        {searching
          ? `${entries.length} ${entries.length === 1 ? 'result' : 'results'} for "${data?.query}" — ranks are for this week`
          : `Top 10 of ${data?.total ?? 0} ${data?.total === 1 ? 'player' : 'players'} this week`}
      </div>

      <div className={styles.tableCard}>
        {loading && !data ? (
          <div className={styles.noResults}>Loading leaderboard…</div>
        ) : loadError ? (
          <div className={`${styles.noResults} ${styles.errorText}`}>{loadError}</div>
        ) : entries.length === 0 ? (
          <div className={styles.noResults}>
            <Search size={28} style={{ margin: '0 auto 0.5rem' }} />
            {searching ? `No players match "${data?.query}" this week.` : 'No one has scored this week yet. Be the first!'}
          </div>
        ) : (
          <div className={styles.tableResponsive} style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.1s' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
                  <th>Member</th>
                  <th style={{ textAlign: 'center' }}>Weekly Points</th>
                  <th style={{ textAlign: 'center' }}>Correct / Wrong</th>
                  <th style={{ textAlign: 'center' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((p) => (
                  <TableRow key={p.id} player={p} isMe={p.id === data?.meId} />
                ))}
                {!searching && data?.me && (
                  <>
                    <tr className={styles.gapRow}><td colSpan={5}>• • •</td></tr>
                    <TableRow player={data.me} isMe />
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const MEDAL_BG = ['bg-[var(--gold)]', 'bg-[var(--silver)]', 'bg-[var(--bronze)]'];

/** Top 3 of every finished week. */
function WinnersHistory() {
  const [weeks, setWeeks] = useState<WeeklyWinnersWeek[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await apiFetch<Partial<WinnersResponse>>('/api/leaderboard/winners');
      if (cancelled) return;
      if (res.ok) setWeeks(res.data.weeks ?? []);
      else setError(res.data.error ?? 'Could not load the past winners.');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="card-neo p-10 text-center text-xs font-bold text-[var(--red)] bg-[var(--bg-secondary)]">{error}</div>;
  if (!weeks) return <div className="card-neo p-10 text-center text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)]">Loading past winners…</div>;
  if (weeks.length === 0) {
    return (
      <div className="card-neo p-10 text-center text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)]">
        No weekly winners yet. The first winners are announced when the first full week (Monday to Sunday) ends.
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      {weeks.map((wk) => (
        <section key={wk.weekStart} className="card-neo p-5 bg-[var(--bg-secondary)] space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-[var(--ink)] flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Week of {fmtWeekRange(wk.weekStart, wk.weekEnd)}
          </h3>
          <div className="space-y-2">
            {wk.winners.map((w) => (
              <div key={w.rank} className="flex items-center gap-3 p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)]">
                <span className={`w-8 h-8 shrink-0 rounded-full border-[2px] border-[var(--ink)] flex items-center justify-center text-sm font-black text-[#1b1712] ${MEDAL_BG[w.rank - 1] ?? ''}`}>
                  {w.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm text-[var(--ink)] truncate">{w.name}</div>
                  {w.uid && <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">{w.uid}</div>}
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-[var(--ink)]">{w.points} ★</div>
                  <div className="font-mono text-[10px] font-bold text-[var(--text-muted)]">{w.correctCount}C / {w.wrongCount}W</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

type Scope = 'week' | 'winners';
const SCOPES: { id: Scope; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'winners', label: 'Past Winners' },
];
const IST_MS = 5.5 * 3600 * 1000;

export function LeaderboardView() {
  const { currentUser, loading: authLoading } = useAuth();
  const [scope, setScope] = useState<Scope>('week');
  const [toastWeek, setToastWeek] = useState<WeeklyWinnersWeek | null>(null);
  const closeToast = useCallback(() => setToastWeek(null), []);

  // On Mondays (IST), announce last week's winners once per day per member (remembered in this browser).
  useEffect(() => {
    if (authLoading) return;
    const ist = new Date(Date.now() + IST_MS);
    if (ist.getUTCDay() !== 1) return;
    const key = `qc_winners_toast:${currentUser?.id ?? 'guest'}:${ist.toISOString().slice(0, 10)}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      return; // storage blocked: skip rather than nag on every visit
    }

    let cancelled = false;
    (async () => {
      const res = await apiFetch<Partial<WinnersResponse>>('/api/leaderboard/winners');
      if (cancelled || !res.ok) return;
      const wk = (res.data.weeks ?? []).find((w) => w.weekStart === res.data.lastWeekStart);
      if (!wk || wk.winners.length === 0) return;
      try {
        localStorage.setItem(key, '1');
      } catch {
        /* ignore */
      }
      setToastWeek(wk);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, currentUser?.id]);

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)]">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                scope === s.id
                  ? 'bg-[var(--yellow)] text-[#1b1712] shadow-[2px_2px_0_var(--ink)] border-[1.5px] border-[var(--ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {scope === 'winners' ? <WinnersHistory /> : <BoardPanel />}

      {toastWeek && <WeeklyWinnersToast week={toastWeek} onClose={closeToast} />}
    </div>
  );
}
