'use client';

import React from 'react';
import { HelpCircle, Star, Crosshair, Sparkles, X } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-lg max-h-[90vh] flex flex-col bg-[var(--bg-secondary)] overflow-hidden space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--ink)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
              <HelpCircle className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--ink)]">
                Rules & Scoring
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Quiz Club KLS GIT Daily Trivia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]"
          >
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 text-xs sm:text-sm font-medium leading-relaxed pr-1">
          {/* Points Tier */}
          <div className="space-y-2">
            <h4 className="font-black text-sm uppercase text-[var(--ink)] flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-[var(--yellow)] text-[var(--ink)]" />
              <span>Points Economy</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--yellow)] shadow-[2px_2px_0_var(--ink)]">
                <div className="text-lg font-black text-[var(--ink)]">100 ★</div>
                <div className="text-[10px] font-bold font-sans">No Hints</div>
              </div>
              <div className="p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--coral)] shadow-[2px_2px_0_var(--ink)]">
                <div className="text-lg font-black text-[var(--ink)]">90 ★</div>
                <div className="text-[10px] font-bold font-sans">Toughest Clue</div>
              </div>
              <div className="p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--yellow)] shadow-[2px_2px_0_var(--ink)]">
                <div className="text-lg font-black text-[var(--ink)]">70 ★</div>
                <div className="text-[10px] font-bold font-sans">Medium Clue</div>
              </div>
              <div className="p-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--teal)] shadow-[2px_2px_0_var(--ink)]">
                <div className="text-lg font-black text-[var(--ink)]">50 ★</div>
                <div className="text-[10px] font-bold font-sans">Easiest Clue</div>
              </div>
            </div>
          </div>

          {/* Expected Funda */}
          <div className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--lilac)]/25 shadow-[2px_2px_0_var(--ink)] space-y-1">
            <h4 className="font-black text-xs uppercase text-[var(--ink)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expected Funda Acceptance</span>
            </h4>
            <p className="text-xs text-[var(--ink)]">
              For any question, if you provide the underlying expected &quot;funda&quot; (the connecting theme, concept, or historical connect), the system evaluates and accepts it as correct!
            </p>
          </div>

          {/* CW Ratio */}
          <div className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/15 shadow-[2px_2px_0_var(--ink)] space-y-1">
            <h4 className="font-black text-xs uppercase text-[var(--ink)] flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Leaderboard Tie-Breaker</span>
            </h4>
            <p className="text-xs text-[var(--ink)]">
              The leaderboard ranks by points. If two members have the same points, the one with the higher <strong>CW Ratio (Correct Answers ÷ Wrong Attempts)</strong> ranks higher, so precision pays off!
            </p>
          </div>

          {/* Weekly leaderboard */}
          <div className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--teal)]/20 shadow-[2px_2px_0_var(--ink)] space-y-1">
            <h4 className="font-black text-xs uppercase text-[var(--ink)] flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>Weekly Leaderboard</span>
            </h4>
            <p className="text-xs text-[var(--ink)]">
              The leaderboard resets every <strong>Monday at 12:00 am IST</strong> and counts points from Monday to Sunday. The top 3 of every week are saved under <strong>Past Winners</strong>. Your streak and all-time points never reset.
            </p>
          </div>

          {/* Coins */}
          <div className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--yellow)]/25 shadow-[2px_2px_0_var(--ink)] space-y-1">
            <h4 className="font-black text-xs uppercase text-[var(--ink)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coins &amp; Streak Freezes</span>
            </h4>
            <p className="text-xs text-[var(--ink)]">
              Coins are separate from points. You earn the same number of coins as the points from each answer, <strong>+5</strong> for showing up each day, and bonuses at streaks of <strong>10</strong> and <strong>50</strong> days and every <strong>100th</strong> day.
              A <strong>streak freeze</strong> (900 coins, or 2 for 1,500) saves your streak if you miss a day. You can hold at most 2. Buy them on your Profile.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className="btn-neo btn-neo-primary text-xs">
            Got it, Let&apos;s Quiz!
          </button>
        </div>
      </div>
    </div>
  );
}
