'use client';

import React, { useState } from 'react';
import { Question, HintTier, Submission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { checkAnswer, MatchResult } from '@/lib/fuzzyMatch';
import { recordSubmission } from '@/lib/storage';
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
  AlertCircle
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onOpenShareModal: (points: number, hints: HintTier[]) => void;
}

export function QuestionCard({ question, onOpenShareModal }: QuestionCardProps) {
  const { currentUser, refreshUser } = useAuth();

  const [unlockedHints, setUnlockedHints] = useState<HintTier[]>([]);
  const [guess, setGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emptyError, setEmptyError] = useState('');
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [hasSolved, setHasSolved] = useState(false);
  const [hasForfeited, setHasForfeited] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  const [confirmUnlockTier, setConfirmUnlockTier] = useState<HintTier | null>(null);
  const [showForfeitModal, setShowForfeitModal] = useState(false);

  // Scoring Rule:
  // No hints: 100 pts
  // Difficult hint: 90 pts
  // Medium hint: 70 pts
  // Easy hint: 50 pts
  const calculateCurrentPotentialPoints = (): number => {
    if (unlockedHints.includes('easy')) return 50;
    if (unlockedHints.includes('medium')) return 70;
    if (unlockedHints.includes('difficult')) return 90;
    return 100;
  };

  const potentialPoints = calculateCurrentPotentialPoints();

  const handleUnlockHint = (tier: HintTier) => {
    if (!unlockedHints.includes(tier)) {
      setUnlockedHints(prev => [...prev, tier]);
    }
    setConfirmUnlockTier(null);
  };

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEmptyError('');

    if (!guess.trim()) {
      setEmptyError('Answer is empty. Please enter your answer or expected funda.');
      return;
    }

    if (submitting || hasSolved || hasForfeited) return;

    setSubmitting(true);

    const result = checkAnswer(
      guess,
      question.answer,
      question.funda,
      question.fundaKeywords || []
    );

    setLastResult(result);

    if (result.isMatch) {
      const awarded = potentialPoints;
      setPointsEarned(awarded);
      setHasSolved(true);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ffce4a', '#ff3b2f', '#36c2ad', '#1b1712']
        });
      } catch (err) {
        console.error(err);
      }

      if (currentUser) {
        const sub: Submission = {
          id: `sub-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userUid: currentUser.uid,
          questionId: question.id,
          guess: guess.trim(),
          hintsUnlocked: unlockedHints,
          pointsAwarded: awarded,
          isCorrect: true,
          matchScore: result.confidence,
          matchFeedback: result.reason,
          timestamp: new Date().toISOString(),
        };
        recordSubmission(sub);
        refreshUser();
      }
    } else {
      if (currentUser) {
        const sub: Submission = {
          id: `sub-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userUid: currentUser.uid,
          questionId: question.id,
          guess: guess.trim(),
          hintsUnlocked: unlockedHints,
          pointsAwarded: 0,
          isCorrect: false,
          matchScore: result.confidence,
          matchFeedback: result.reason,
          timestamp: new Date().toISOString(),
        };
        recordSubmission(sub);
        refreshUser();
      }
    }

    setSubmitting(false);
  };

  const handleConfirmForfeit = () => {
    setShowForfeitModal(false);
    setHasForfeited(true);
    setPointsEarned(0);

    if (currentUser) {
      const sub: Submission = {
        id: `sub-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userUid: currentUser.uid,
        questionId: question.id,
        guess: '[Forfeited]',
        hintsUnlocked: unlockedHints,
        pointsAwarded: 0,
        isCorrect: false,
        matchScore: 0,
        matchFeedback: 'Participant revealed the solution.',
        timestamp: new Date().toISOString(),
      };
      recordSubmission(sub);
      refreshUser();
    }
  };

  // 3 Hints: Difficult -> Medium -> Easy
  const hints = [
    {
      tier: 'difficult' as HintTier,
      label: 'Clue 1 • Toughest Hint',
      badgeColor: 'bg-[var(--coral)]',
      maxPts: 90,
      text: question.hints?.difficult,
    },
    {
      tier: 'medium' as HintTier,
      label: 'Clue 2 • Medium Hint',
      badgeColor: 'bg-[var(--yellow)]',
      maxPts: 70,
      text: question.hints?.medium,
    },
    {
      tier: 'easy' as HintTier,
      label: 'Clue 3 • Easiest Hint',
      badgeColor: 'bg-[var(--teal)]',
      maxPts: 50,
      text: question.hints?.easy,
    },
  ].filter(h => Boolean(h.text));

  return (
    <div className="card-neo p-6 md:p-8 space-y-7">
      {/* 1. Header & Meta Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b-[2px] border-[var(--ink)]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            EDITION #{question.edition}
          </span>
          <span className="text-xs font-bold text-[var(--text-secondary)] font-mono">
            {question.date || 'Today'}
          </span>
        </div>

        {/* Potential Score Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Available Reward:</span>
          <span className="font-mono font-black text-sm px-3 py-0.5 rounded-full bg-[var(--bg-secondary)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            {hasSolved ? pointsEarned : potentialPoints} ★
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
          Answering the exact name or the underlying expected funda/concept is accepted as correct!
        </p>
      </div>

      {/* 3. CLUE STACK (3 HINTS: DIFFICULT -> MEDIUM -> EASY) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="uppercase tracking-wider text-[var(--text-secondary)]">
            Hints Stack ({hints.length} available)
          </span>
          <span className="text-[var(--text-muted)] font-mono">
            Unlocking drops maximum score
          </span>
        </div>

        {hints.length === 0 ? (
          <div className="p-4 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper-deep)] text-xs font-bold text-[var(--text-muted)]">
            No hints provided for this question.
          </div>
        ) : (
          <div className="grid gap-3">
            {hints.map((h) => {
              const isUnlocked = unlockedHints.includes(h.tier);

              return (
                <div
                  key={h.tier}
                  className={`rounded-xl border-[2px] border-[var(--ink)] transition-all ${
                    isUnlocked
                      ? 'bg-[var(--bg-secondary)] shadow-[4px_4px_0_var(--ink)]'
                      : 'bg-[var(--paper-deep)] shadow-[2px_2px_0_var(--ink)]'
                  }`}
                >
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border-[1.5px] border-[var(--ink)] text-[var(--ink)] ${h.badgeColor}`}>
                        {h.tier.toUpperCase()}
                      </span>
                      <span className="font-extrabold text-sm text-[var(--ink)]">
                        {h.label}
                      </span>
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ink)] bg-[var(--yellow)] px-2.5 py-1 rounded-full border-[1.5px] border-[var(--ink)]">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Revealed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmUnlockTier(h.tier)}
                        disabled={hasSolved || hasForfeited}
                        className="btn-neo btn-neo-secondary !py-1 !px-3 text-xs"
                      >
                        <Lock className="w-3 h-3 text-[var(--ink)]" />
                        <span>Unlock (Max {h.maxPts}★)</span>
                      </button>
                    )}
                  </div>

                  {isUnlocked && (
                    <div className="px-4 pb-4 pt-1 border-t-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] text-sm font-medium leading-relaxed rounded-b-xl">
                      <p className="text-[var(--ink)]">
                        {h.text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ANSWER INPUT & SUBMISSION (NO PLACEHOLDERS) */}
      <div className="pt-4 border-t-[2.5px] border-[var(--ink)] space-y-4">
        {!hasSolved && !hasForfeited ? (
          <form onSubmit={handleGuessSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Your Answer or Funda
              </label>
              <input
                type="text"
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value);
                  if (emptyError) setEmptyError('');
                }}
                className="w-full px-4 py-3.5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--bg-secondary)] text-[var(--ink)] text-sm font-semibold shadow-[4px_4px_0_var(--ink)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[6px_6px_0_var(--ink)] transition-all"
              />
            </div>

            {emptyError && (
              <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0" />
                <span>{emptyError}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowForfeitModal(true)}
                className="btn-neo btn-neo-secondary text-xs text-[var(--red)]"
              >
                Reveal Answer (Forfeit)
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn-neo btn-neo-primary text-xs !py-3 !px-6"
              >
                <Send className="w-4 h-4" />
                <span>Submit Answer ({potentialPoints} ★)</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* When Solved */}
        {hasSolved && (
          <div className="p-5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--teal)]/20 shadow-[6px_6px_0_var(--ink)] space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-7 h-7 text-[var(--teal)] stroke-[2.5] shrink-0" />
                <div>
                  <h4 className="text-xl font-black text-[var(--ink)]">
                    CORRECT! +{pointsEarned} POINTS AWARDED
                  </h4>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                    {lastResult?.reason}
                  </p>
                </div>
              </div>
              <span className="font-mono text-2xl font-black text-[var(--ink)] px-3 py-1 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                +{pointsEarned}★
              </span>
            </div>

            <div className="pt-2 border-t-[2px] border-[var(--ink)] text-xs font-bold text-[var(--ink)]">
              Official Solution: <span className="font-normal">{question.answer}</span>
              {question.funda && (
                <div className="mt-1 text-[var(--text-secondary)] font-medium">
                  Accepted Funda: {question.funda}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => onOpenShareModal(pointsEarned || 100, unlockedHints)}
                className="btn-neo btn-neo-yellow text-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Results</span>
              </button>
            </div>
          </div>
        )}

        {/* When Forfeited */}
        {hasForfeited && (
          <div className="p-5 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--red)]/15 shadow-[6px_6px_0_var(--ink)] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[var(--red)] stroke-[2.5]" />
              <h4 className="text-lg font-black text-[var(--ink)]">
                Puzzle Forfeited (0 Points)
              </h4>
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              The official solution is:
            </p>
            <div className="p-3 rounded-lg border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] font-bold text-sm text-[var(--ink)]">
              {question.answer}
              {question.funda && (
                <div className="mt-1 text-xs text-[var(--text-secondary)] font-medium">
                  Accepted Funda: {question.funda}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Incorrect guess feedback */}
        {lastResult && !lastResult.isMatch && !hasForfeited && (
          <div className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/15 text-xs font-bold text-[var(--ink)] flex items-center gap-2.5 shadow-[3px_3px_0_var(--ink)] animate-shake">
            <XCircle className="w-5 h-5 text-[var(--red)] shrink-0" />
            <span>{lastResult.reason}</span>
          </div>
        )}
      </div>

      {/* Confirmation to Unlock Clue */}
      {confirmUnlockTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--red)]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
              <h3 className="text-lg font-extrabold text-[var(--ink)]">
                Unlock Clue Confirmation
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Unlocking this clue caps your potential score to{' '}
              <strong className="text-[var(--ink)] font-black">
                {confirmUnlockTier === 'difficult' ? '90 ★' : confirmUnlockTier === 'medium' ? '70 ★' : '50 ★'}
              </strong>
              . Are you sure you want to reveal it?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmUnlockTier(null)}
                className="btn-neo btn-neo-secondary text-xs"
              >
                Keep Thinking
              </button>
              <button
                onClick={() => handleUnlockHint(confirmUnlockTier)}
                className="btn-neo btn-neo-primary text-xs"
              >
                Yes, Reveal Clue
              </button>
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
              <h3 className="text-lg font-extrabold text-[var(--ink)]">
                Forfeit Puzzle?
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              Revealing the solution will forfeit your chance to earn points for Edition #{question.edition}. We encourage trying another guess or unlocking a clue first!
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowForfeitModal(false)}
                className="btn-neo btn-neo-secondary text-xs"
              >
                Keep Trying
              </button>
              <button
                onClick={handleConfirmForfeit}
                className="btn-neo btn-neo-primary text-xs"
              >
                Reveal Answer (0 pts)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
