'use client';

import React, { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import type { WeeklyWinnersWeek } from '@/types';

const MEDAL = ['var(--gold)', 'var(--silver)', 'var(--bronze)'];

/** "16 Nov – 22 Nov" for a Monday and the Sunday that ends the week. */
export function fmtWeekRange(start: string, end: string): string {
  const f = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `${f(start)} – ${f(end)}`;
}

interface Props {
  week: WeeklyWinnersWeek;
  onClose: () => void;
}

/** Monday announcement of last week's top 3, with a burst of confetti. */
export function WeeklyWinnersToast({ week, onClose }: Props) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const confetti = (await import('canvas-confetti')).default;
        if (cancelled) return;
        const burst = (x: number) =>
          confetti({ particleCount: 90, spread: 75, startVelocity: 45, origin: { x, y: 0.7 }, zIndex: 100 });
        burst(0.2);
        burst(0.8);
        setTimeout(() => {
          if (!cancelled) burst(0.5);
        }, 350);
      } catch {
        /* confetti is a bonus; ignore failures */
      }
    })();
    const timer = setTimeout(onClose, 15000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 top-4 z-[70] flex justify-center px-4 pointer-events-none">
      <div
        role="status"
        className="card-neo pointer-events-auto w-full max-w-md p-5 bg-[var(--bg-secondary)] space-y-3 animate-fadeIn"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
              <Trophy className="w-5 h-5 text-[#1b1712]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--ink)]">Last week&apos;s winners</h3>
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">{fmtWeekRange(week.weekStart, week.weekEnd)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]"
          >
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        <div className="space-y-2">
          {week.winners.map((w) => (
            <div
              key={w.rank}
              className="flex items-center gap-3 p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] shadow-[2px_2px_0_var(--ink)]"
            >
              <span
                className="w-8 h-8 shrink-0 rounded-full border-[2px] border-[var(--ink)] flex items-center justify-center text-sm font-black text-[#1b1712]"
                style={{ background: MEDAL[w.rank - 1] ?? 'var(--paper-deep)' }}
              >
                {w.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-[var(--ink)] truncate">{w.name}</div>
                {w.uid && <div className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">{w.uid}</div>}
              </div>
              <div className="font-mono text-sm font-black text-[var(--ink)]">{w.points} ★</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
