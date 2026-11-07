'use client';

import React, { useState } from 'react';
import { HintTier, Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Lock, Unlock, AlertTriangle, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface ClueStackProps {
  question: Question;
  unlockedHints: HintTier[];
  onUnlockHint: (tier: HintTier) => void;
  disabled?: boolean;
}

export function ClueStack({
  question,
  unlockedHints,
  onUnlockHint,
  disabled = false,
}: ClueStackProps) {
  const { isDark } = useTheme();
  const [confirmUnlockTier, setConfirmUnlockTier] = useState<HintTier | null>(null);

  // Available hints in order: difficult -> medium -> easy
  const hintList: {
    tier: HintTier;
    title: string;
    description: string;
    badge: string;
    badgeStyle: string;
    pointsResult: number;
    text?: string;
  }[] = [
    {
      tier: 'difficult' as HintTier,
      title: 'Clue 1 • Toughest Hint',
      description: 'The most obscure connection. Unlocking drops maximum payout to 90 ★.',
      badge: 'TOUGHEST',
      badgeStyle: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
      pointsResult: 90,
      text: question.hints?.difficult,
    },
    {
      tier: 'medium' as HintTier,
      title: 'Clue 2 • Medium Hint',
      description: 'A clearer historical or conceptual angle. Unlocking drops maximum payout to 70 ★.',
      badge: 'MEDIUM',
      badgeStyle: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
      pointsResult: 70,
      text: question.hints?.medium,
    },
    {
      tier: 'easy' as HintTier,
      title: 'Clue 3 • Easiest Hint',
      description: 'The closest direct pointer. Unlocking drops maximum payout to 50 ★.',
      badge: 'EASIEST',
      badgeStyle: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
      pointsResult: 50,
      text: question.hints?.easy,
    },
  ].filter(h => Boolean(h.text)); // Only show hints created by QM (1 to 3 hints)

  const handlePromptUnlock = (tier: HintTier) => {
    if (disabled || unlockedHints.includes(tier)) return;
    setConfirmUnlockTier(tier);
  };

  const handleConfirm = () => {
    if (confirmUnlockTier) {
      onUnlockHint(confirmUnlockTier);
      setConfirmUnlockTier(null);
    }
  };

  return (
    <div className="space-y-3.5 my-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-sm tracking-wide uppercase opacity-75">
            Today’s References & Clue Stack
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-semibold">
            {hintList.length} Hints Available
          </span>
        </div>
        <span className="text-[11px] opacity-70">
          Progressive Disclosure: hardest to easiest
        </span>
      </div>

      <div className="grid gap-3">
        {hintList.map((h, index) => {
          const isUnlocked = unlockedHints.includes(h.tier);

          return (
            <div
              key={h.tier}
              className={`rounded-xl border transition-all duration-300 relative overflow-hidden ${
                isUnlocked
                  ? isDark
                    ? 'bg-[#1b2033] border-amber-500/40 shadow-sm'
                    : 'bg-white border-amber-300 shadow-sm shadow-amber-50'
                  : isDark
                  ? 'bg-[#151824] border-[#292f45] opacity-95'
                  : 'bg-[#faf7f2] border-[#e2d9ca]'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${h.badgeStyle}`}>
                      {h.badge}
                    </span>
                    <h4 className="font-serif font-bold text-sm">
                      {h.title}
                    </h4>
                  </div>
                  {!isUnlocked && (
                    <p className="text-xs opacity-70 leading-relaxed">
                      {h.description}
                    </p>
                  )}
                </div>

                {/* Status / Unlock Button */}
                <div>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Revealed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePromptUnlock(h.tier)}
                      disabled={disabled}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border shadow-sm ${
                        disabled
                          ? 'opacity-40 cursor-not-allowed border-transparent'
                          : isDark
                          ? 'bg-[#22283e] border-[#394263] text-amber-300 hover:bg-amber-500/20 hover:border-amber-400'
                          : 'bg-white border-stone-300 text-stone-800 hover:bg-amber-50 hover:border-amber-300'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unlock Clue</span>
                      <span className="font-mono text-[10px] opacity-75">
                        (Max {h.pointsResult}★)
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Revealed Content */}
              {isUnlocked && (
                <div 
                  className={`px-4 pb-4 pt-1 border-t text-sm leading-relaxed ${
                    isDark 
                      ? 'border-[#2d3550] text-slate-100 bg-[#161a29]/60' 
                      : 'border-amber-100 text-stone-800 bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="font-serif text-[14px] leading-relaxed">
                      {h.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unlock Confirmation Modal (Accidental Click Safeguard) */}
      {confirmUnlockTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
              isDark 
                ? 'bg-[#181d2c] border-[#313a57] text-white' 
                : 'bg-white border-amber-200 text-stone-900 shadow-amber-100'
            }`}
          >
            <div className="flex items-center gap-2.5 text-amber-500 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg">
                Unlock Clue Confirmation
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm leading-relaxed opacity-85 mb-4">
              Are you sure you want to reveal this hint? Revealing it will adjust your maximum possible score from this question to{' '}
              <strong className="text-amber-500 font-mono text-base">
                {confirmUnlockTier === 'difficult' ? '90 ★' : confirmUnlockTier === 'medium' ? '70 ★' : '50 ★'}
              </strong>
              . Quizmasters encourage you to attempt a first guess if you have an inkling!
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConfirmUnlockTier(null)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                  isDark 
                    ? 'border-[#374163] hover:bg-[#252c44]' 
                    : 'border-stone-300 hover:bg-stone-100'
                }`}
              >
                Keep Thinking
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Yes, Reveal Clue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
