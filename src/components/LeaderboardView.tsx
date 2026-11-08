'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { LeaderboardEntry, LeaderboardResponse } from '@/types';
import { Award, Target, Flame, Search } from 'lucide-react';
import styles from './LeaderboardView.module.css';

type Sort = 'points' | 'cw';

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : '3rd');

function PodiumCard({ user, rank }: { user: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const medal = rank === 1 ? styles.goldMedal : rank === 2 ? styles.silverMedal : styles.bronzeMedal;
  return (
    <div className={`${styles.podiumCard} ${medal} ${rank === 1 ? styles.podiumCardFirst : ''}`}>
      <div className={styles.podiumBadge}>{ordinal(rank)}</div>

      <div className={styles.podiumAvatar}>{user.name.charAt(0).toUpperCase()}</div>

      <div className={styles.podiumUserInfo}>
        <h3 className={styles.podiumName}>{user.name}</h3>
        <span className={styles.podiumUid}>{user.uid}</span>
      </div>

      <div className={styles.podiumScoreContainer}>
        <span className={styles.podiumScoreVal}>{user.points}</span>
        <span className={styles.podiumScoreLabel}>Points</span>
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
        <div className={styles.podiumStat}>
          <span className={styles.statDot} style={{ background: 'var(--yellow)' }} />
          <span>{user.cwRatio.toFixed(2)} CW</span>
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
        <div className={styles.userCell}>
          <div className={styles.userAvatarSmall}>{player.name.charAt(0).toUpperCase()}</div>
          <div className={styles.userNameBlock}>
            <div className={styles.userDisplayName}>
              <span className={styles.nameText}>{player.name}</span>
              {isMe && <span className={styles.youTag}>YOU</span>}
            </div>
            <div className={styles.userUid}>{player.uid}</div>
          </div>
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={styles.scoreHighlight}>{player.points}</span>
      </td>
      <td>
        <div className={styles.pills}>
          <span className={`${styles.pill} ${styles.correctPill}`}>{player.correctCount} C</span>
          <span className={`${styles.pill} ${styles.wrongPill}`}>{player.wrongCount} W</span>
          <span className={`${styles.pill} ${styles.ratioPill}`} title="Correct ÷ Wrong">{player.cwRatio.toFixed(2)} CW</span>
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
  const byRank = (r: number) => entries.find((e) => e.rank === r);
  const podium: { user: LeaderboardEntry; rank: 1 | 2 | 3 }[] = [];
  if (byRank(2)) podium.push({ user: byRank(2)!, rank: 2 });
  if (byRank(1)) podium.push({ user: byRank(1)!, rank: 1 });
  if (byRank(3)) podium.push({ user: byRank(3)!, rank: 3 });

  return (
    <div className={styles.wrapper}>
      {/* Podium: shown when sorting by points */}
      {sortBy === 'points' && podium.length > 0 && (
        <section className={styles.podiumSection}>
          <h3 className={styles.podiumTitle}>Top Quizzers</h3>
          <div className={styles.podiumContainer}>
            {podium.map(({ user, rank }) => (
              <PodiumCard key={user.id} user={user} rank={rank} />
            ))}
          </div>
        </section>
      )}

      <div className={styles.controlsBar}>
        <div className={styles.countLabel}>
          Top 10 of {data?.total ?? 0} {data?.total === 1 ? 'member' : 'members'}
        </div>
        <div className={styles.sortOptions}>
          <span className={styles.sortLabel}>Sort By:</span>
          <div className={styles.sortButtonGroup}>
            <button onClick={() => setSortBy('points')} className={`${styles.sortButton} ${sortBy === 'points' ? styles.sortButtonActive : ''}`}>
              <Award size={14} /> Points
            </button>
            <button onClick={() => setSortBy('cw')} className={`${styles.sortButton} ${sortBy === 'cw' ? styles.sortButtonActive : ''}`}>
              <Target size={14} /> CW Ratio
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading && !data ? (
          <div className={styles.noResults}>Loading leaderboard…</div>
        ) : loadError ? (
          <div className={`${styles.noResults} ${styles.errorText}`}>{loadError}</div>
        ) : entries.length === 0 ? (
          <div className={styles.noResults}>
            <Search size={28} style={{ margin: '0 auto 0.5rem' }} />
            No participants on the leaderboard yet.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
                  <th>Member</th>
                  <th style={{ textAlign: 'center' }}>Points</th>
                  <th style={{ textAlign: 'center' }}>Correct / Wrong</th>
                  <th style={{ textAlign: 'center' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((p) => (
                  <TableRow key={p.id} player={p} isMe={p.id === data?.meId} />
                ))}
                {data?.me && (
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
