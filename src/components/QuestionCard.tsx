'use client';

import React, { useState } from 'react';
import { HintTier, QotdState } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import confetti from 'canvas-confetti';
import {
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Share2,
  ShieldAlert,
  Flame,
  AlertCircle,
} from 'lucide-react';

interface QuestionCardProps {
  qotd: QotdState;
  onChange: (state: QotdState) => void;
  onOpenShareModal: (points: number, hints: HintTier[]) => void;
}

const HINT_META: Record<HintTier, { label: string; badgeColor: string; maxPts: number }> = {
  difficult: { label: 'Clue 1 • Toughest Hint', badgeColor: 'bg-[var(--coral)]', maxPts: 90 },
  medium: { label: 'Clue 2 • Medium Hint', badgeColor: 'bg-[var(--yellow)]', maxPts: 70 },
  easy: { label: 'Clue 3 • Easiest Hint', badgeColor: 'bg-[var(--teal)]', maxPts: 50 },
};

export function QuestionCard({ qotd, onChange, onOpenShareModal }: QuestionCardProps) {
  const { refreshUser } = useAuth();
  const question = qotd.question!;
  const { submission, solution, unlockedHints } = qotd;

  const [guess, setGuess] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmUnlockTier, setConfirmUnlockTier] = useState<HintTier | null>(null);
  const [showForfeitModal, setShowForfeitModal] = useState(false);

  const unlockedTiers = Object.keys(unlockedHints) as HintTier[];
  const potentialPoints = unlockedTiers.includes('easy')
    ? 50
    : unlockedTiers.includes('medium')
    ? 70
    : unlockedTiers.includes('difficult')
    ? 90
    : 100;

  const finished = submission !== null;
  const solved = submission?.isCorrect === true;
  const forfeited = submission?.forfeited === true;
  const wrong = finished && !solved && !forfeited;

  // Every action goes to the server; the server owns all state (hints, points, attempts).
  const post = async (url: string, body?: unknown): Promise<QotdState | null> => {
    setBusy(true);
    setError('');
    const res = await apiFetch<{ state?: QotdState }>(url, { method: 'POST', body: body ?? {} });
    setBusy(false);
    if (res.data.state) onChange(res.data.state);
    if (!res.ok) {
      setError(res.data.error || 'Something went wrong. Please try again.');
      return null;
    }
    return res.data.state ?? null;
  };

  const handleUnlockHint = async (tier: HintTier) => {
    setConfirmUnlockTier(null);
    await post('/api/qotd/hint', { tier });
  };

  const handleGuessSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (busy || finished) return;
    if (!guess.trim()) {
      setError('Answer is empty. Please enter your answer or expected funda.');
      return;
    }
    const state = await post('/api/qotd/submit', { guess });
    if (!state) return;
    await refreshUser();
    if (state.submission?.isCorrect) {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors: ['#ffce4a', '#ff3b2f', '#36c2ad', '#1b1712'] });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfirmForfeit = async () => {
    setShowForfeitModal(false);
    const state = await post('/api/qotd/forfeit');
    if (state) await refreshUser();
  };

  const hints = question.availableHints.map((tier) => ({ tier, ...HINT_META[tier], text: unlockedHints[tier] }));

  return (
    <div className="card-neo p-6 md:p-8 space-y-7">
      {/* 1. Header & Meta Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b-[2px] border-[var(--ink)]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            EDITION #{question.edition}
          </span>
          <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">{question.date || 'Today'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)]">{finished ? 'Your Reward:' : 'Available Reward:'}</span>
          <span className="font-mono font-black text-sm px-3 py-0.5 rounded-full bg-[var(--bg-secondary)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            {finished ? submission!.pointsAwarded : potentialPoints} ★
          </span>
        </div>
      </div>

      {/* 2. QUESTION ON THE TOP */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[var(--red)]">
          <Flame className="w-4 h-4 fill-[var(--red)]" />
          <span>Question of the Day</span>
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug tracking-tight text-[var(--ink)]">
          {question.questionText}
        </h2>
        <p className="text-xs font-semibold text-[var(--text-secondary)]">
          Answering the exact name or the underlying expected funda/concept is accepted as correct! You get <strong>one attempt</strong>.
        </p>
      </div>

      {/* 3. CLUE STACK */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-wider text-[var(--text-secondary)]">Hints Stack ({hints.length} available)</span>
          <span className="text-[var(--text-muted)] font-mono">Unlocking drops maximum score</span>
        </div>

        {hints.length === 0 ? (
          <div className="p-4 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper-deep)] text-xs font-bold text-[var(--text-muted)]">
            No hints provided for this question.
          </div>
        ) : (
          <div className="grid gap-3">
            {hints.map((h) => {
              const isUnlocked = Boolean(h.text);
              return (
                <div
                  key={h.tier}
                  className={`rounded-xl border-[2px] border-[var(--ink)] transition-all ${
                    isUnlocked ? 'bg-[var(--bg-secondary)] shadow-[4px_4px_0_var(--ink)]' : 'bg-[var(--paper-deep)] shadow-[2px_2px_0_var(--ink)]'
                  }`}
                >
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-[1.5px] border-[var(--ink)] text-[var(--ink)] ${h.badgeColor}`}>
                        {h.tier.toUpperCase()}
                      </span>
                      <span className="font-extrabold text-sm text-[var(--ink)]">{h.label}</span>
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ink)] bg-[var(--yellow)] px-2.5 py-1 rounded-full border-[1.5px] border-[var(--ink)]">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Revealed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmUnlockTier(h.tier)}
                        disabled={finished || busy}
                        className="btn-neo btn-neo-secondary !py-1 !px-3 text-xs disabled:opacity-50"
                      >
                        <Lock className="w-3 h-3 text-[var(--ink)]" />
                        <span>Unlock (Max {h.maxPts}★)</span>
                      </button>
                    )}
                  </div>

                  {isUnlocked && (
                    <div className="px-4 pb-4 pt-1 border-t-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] text-sm font-medium leading-relaxed rounded-b-xl">
                      <p className="text-[var(--ink)]">{h.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ANSWER INPUT & RESULT */}
      <div className="pt-4 border-t-[2.5px] border-[var(--ink)] space-y-4">
        {!finished && (
          <form onSubmit={handleGuessSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">Your Answer or Funda</label>
              <input
                type="text"
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type your answer or funda..."
                maxLength={300}
                className="w-full px-4 py-3.5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--bg-secondary)] text-[var(--ink)] text-sm font-semibold shadow-[4px_4px_0_var(--ink)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[6px_6px_0_var(--ink)] transition-all placeholder:text-[var(--text-muted)] placeholder:font-normal"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowForfeitModal(true)}
                disabled={busy}
                className="btn-neo btn-neo-secondary text-xs text-[var(--red)]"
              >
                Reveal Answer (Forfeit)
              </button>

              <button type="submit" disabled={busy} className="btn-neo btn-neo-primary text-xs !py-3 !px-6">
                <Send className="w-4 h-4" />
                <span>{busy ? 'Checking…' : `Submit Answer (${potentialPoints} ★)`}</span>
              </button>
            </div>
          </form>
        )}

        {/* Error that arrives after the question is already finished (e.g. 409) */}
        {finished && error && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)]">{error}</div>
        )}

        {/* When Solved */}
        {solved && (
          <div className="p-5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--teal)]/20 shadow-[6px_6px_0_var(--ink)] space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-7 h-7 text-[var(--teal)] stroke-[2.5] shrink-0" />
                <div>
                  <h4 className="text-xl font-black text-[var(--ink)]">CORRECT! +{submission!.pointsAwarded} POINTS AWARDED</h4>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">{submission!.feedback}</p>
                </div>
              </div>
              <span className="font-mono text-2xl font-black text-[var(--ink)] px-3 py-1 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                +{submission!.pointsAwarded}★
              </span>
            </div>

            {solution && (
              <div className="pt-2 border-t-[2px] border-[var(--ink)] text-xs font-bold text-[var(--ink)]">
                Official Solution: <span className="font-normal">{solution.answer}</span>
                {solution.funda && <div className="mt-1 text-[var(--text-secondary)] font-medium">Accepted Funda: {solution.funda}</div>}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button onClick={() => onOpenShareModal(submission!.pointsAwarded, submission!.hintsUnlocked)} className="btn-neo btn-neo-yellow text-xs">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Results</span>
              </button>
            </div>
          </div>
        )}

        {/* Wrong answer: the single attempt is used */}
        {wrong && (
          <div className="p-5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--red)]/15 shadow-[6px_6px_0_var(--ink)] space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-[var(--red)] stroke-[2.5]" />
              <h4 className="text-lg font-black text-[var(--ink)]">Not this time (0 Points)</h4>
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              You answered &quot;{submission!.guess}&quot;. Your attempt for this question is used — come back for the next one!
            </p>
            {solution && (
              <div className="p-3 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] font-bold text-sm text-[var(--ink)]">
                {solution.answer}
                {solution.funda && <div className="mt-1 text-xs text-[var(--text-secondary)] font-medium">Accepted Funda: {solution.funda}</div>}
              </div>
            )}
          </div>
        )}

        {/* When Forfeited */}
        {forfeited && (
          <div className="p-5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--red)]/15 shadow-[6px_6px_0_var(--ink)] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[var(--red)] stroke-[2.5]" />
              <h4 className="text-lg font-black text-[var(--ink)]">Puzzle Forfeited (0 Points)</h4>
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">The official solution is:</p>
            {solution && (
              <div className="p-3 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] font-bold text-sm text-[var(--ink)]">
                {solution.answer}
                {solution.funda && <div className="mt-1 text-xs text-[var(--text-secondary)] font-medium">Accepted Funda: {solution.funda}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation to Unlock Clue */}
      {confirmUnlockTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--red)]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              <h3 className="text-lg font-extrabold text-[var(--ink)]">Unlock Clue Confirmation</h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Unlocking this clue caps your potential score to{' '}
              <strong className="text-[var(--ink)] font-black">{HINT_META[confirmUnlockTier].maxPts} ★</strong>. Are you sure you want to reveal it?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button onClick={() => setConfirmUnlockTier(null)} className="btn-neo btn-neo-secondary text-xs">Keep Thinking</button>
              <button onClick={() => handleUnlockHint(confirmUnlockTier)} className="btn-neo btn-neo-primary text-xs">Yes, Reveal Clue</button>
            </div>
          </div>
        </div>
      )}

      {/* Forfeit Confirmation */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--red)]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              <h3 className="text-lg font-extrabold text-[var(--ink)]">Forfeit Puzzle?</h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Revealing the solution will forfeit your only attempt at Edition #{question.edition}. We encourage unlocking a clue first!
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button onClick={() => setShowForfeitModal(false)} className="btn-neo btn-neo-secondary text-xs">Keep Trying</button>
              <button onClick={handleConfirmForfeit} className="btn-neo btn-neo-primary text-xs">Reveal Answer (0 pts)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
