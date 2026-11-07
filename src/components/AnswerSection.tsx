'use client';

import React, { useState } from 'react';
import { Question, HintTier, Submission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { checkAnswer, MatchResult } from '@/lib/fuzzyMatch';
import { recordSubmission } from '@/lib/storage';
import confetti from 'canvas-confetti';
import { 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertCircle, 
  Share2, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface AnswerSectionProps {
  question: Question;
  unlockedHints: HintTier[];
  onCorrectAnswer?: (submission: Submission) => void;
  onOpenShareModal: () => void;
  onCompanionMessage?: (msg: string) => void;
}

export function AnswerSection({
  question,
  unlockedHints,
  onCorrectAnswer,
  onOpenShareModal,
  onCompanionMessage,
}: AnswerSectionProps) {
  const { currentUser, refreshUser } = useAuth();
  const { isDark } = useTheme();

  const [guess, setGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [hasSolved, setHasSolved] = useState(false);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [hasForfeited, setHasForfeited] = useState(false);

  // Scoring Rule calculation
  // No hints: 100 pts
  // Difficult hint used: 90 pts
  // Medium hint used: 70 pts
  // Easy hint used: 50 pts
  const calculateCurrentPotentialPoints = (): number => {
    if (unlockedHints.includes('easy')) return 50;
    if (unlockedHints.includes('medium')) return 70;
    if (unlockedHints.includes('difficult')) return 90;
    return 100;
  };

  const potentialPoints = calculateCurrentPotentialPoints();

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guess.trim() || submitting || hasSolved || hasForfeited) return;

    setSubmitting(true);

    const result = checkAnswer(
      guess,
      question.answer,
      question.fundaKeywords || [],
      question.isFunda
    );

    setLastResult(result);

    if (result.isMatch) {
      // Award points
      const awarded = potentialPoints;
      setPointsEarned(awarded);
      setHasSolved(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff']
        });
      } catch (err) {
        console.error(err);
      }

      if (onCompanionMessage) {
        onCompanionMessage(
          result.isCloseEnough 
            ? 'Brilliant! Funda accepted with conceptual precision!' 
            : 'Outstanding! Direct hit on the answer!'
        );
      }

      // Record submission
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
        if (onCorrectAnswer) onCorrectAnswer(sub);
      }
    } else {
      if (onCompanionMessage) {
        onCompanionMessage('Close attempt, but not quite! Ponder the clues further.');
      }

      // Record wrong attempt for K/D ratio tracking
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
        guess: '[Forfeited/Revealed]',
        hintsUnlocked: unlockedHints,
        pointsAwarded: 0,
        isCorrect: false,
        matchScore: 0,
        matchFeedback: 'Participant chose to reveal answer.',
        timestamp: new Date().toISOString(),
      };
      recordSubmission(sub);
      refreshUser();
    }

    if (onCompanionMessage) {
      onCompanionMessage('Solution revealed! Study the funda and crack the next edition.');
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Active Points Pot */}
      <div 
        className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
          isDark 
            ? 'bg-[#181d2c] border-[#2e3752]' 
            : 'bg-[#faf6ee] border-[#ebdcc7]'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
            ★
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-amber-500">
              Active Value Bank
            </div>
            <div className="text-xs opacity-75">
              {unlockedHints.length === 0
                ? 'Solving now fetches maximum 100 points'
                : `Score capped at ${potentialPoints} ★ based on hints revealed`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-2xl font-black text-amber-500">
            {hasSolved ? pointsEarned : potentialPoints}
          </span>
          <span className="text-xs font-bold text-amber-500 ml-1">★</span>
        </div>
      </div>

      {/* Input Box & Action Buttons */}
      {!hasSolved && !hasForfeited ? (
        <form onSubmit={handleGuessSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your answer or funda here... (e.g. key name, event, theory)"
              className={`w-full px-4 py-3.5 rounded-xl border text-sm font-medium transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark 
                  ? 'bg-[#141724] border-[#2c334d] text-white placeholder-slate-500' 
                  : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Forfeit / Reveal button */}
            <button
              type="button"
              onClick={() => setShowForfeitModal(true)}
              className={`text-xs font-semibold px-3.5 py-2.5 rounded-lg border transition-all ${
                isDark 
                  ? 'border-[#2d344d] text-slate-400 hover:text-rose-400 hover:border-rose-500/30' 
                  : 'border-stone-300 text-stone-500 hover:text-rose-600 hover:border-rose-300'
              }`}
            >
              Reveal & Forfeit
            </button>

            {/* Submit Guess Button */}
            <button
              type="submit"
              disabled={!guess.trim() || submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                !guess.trim() || submitting
                  ? 'opacity-40 cursor-not-allowed bg-stone-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-500/25 active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Answer ({potentialPoints} ★)</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* Result Card: When Solved */}
      {hasSolved && (
        <div 
          className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
            isDark 
              ? 'bg-[#152321] border-emerald-500/40 text-emerald-100' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-serif font-bold text-lg text-emerald-500">
                  CRACKED! +{pointsEarned} POINTS AWARDED
                </h4>
                <p className="text-xs opacity-90 leading-relaxed mt-0.5">
                  {lastResult?.reason}
                </p>
              </div>
            </div>
            <span className="font-mono text-xl font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
              +{pointsEarned} ★
            </span>
          </div>

          <div 
            className={`mt-4 pt-3 border-t text-xs leading-relaxed ${
              isDark ? 'border-emerald-500/20 text-slate-300' : 'border-emerald-200 text-stone-700'
            }`}
          >
            <strong>Official Canonical Answer:</strong> {question.answer}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={onOpenShareModal}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Result</span>
            </button>
          </div>
        </div>
      )}

      {/* Result Card: When Forfeited */}
      {hasForfeited && (
        <div 
          className={`p-5 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-[#241a20] border-rose-500/40 text-rose-100' 
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <h4 className="font-serif font-bold text-base text-rose-500">
              Puzzle Forfeited (0 Points)
            </h4>
          </div>
          <p className="text-xs opacity-85 leading-relaxed">
            The canonical solution for this edition is:
          </p>
          <div className="mt-2 p-3 rounded-lg bg-black/20 font-serif font-semibold text-sm">
            {question.answer}
          </div>
        </div>
      )}

      {/* Feedback banner for incorrect guess */}
      {lastResult && !lastResult.isMatch && !hasForfeited && (
        <div 
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-shake ${
            isDark 
              ? 'bg-[#271b1e] border-rose-500/30 text-rose-200' 
              : 'bg-rose-50/90 border-rose-200 text-rose-900'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-rose-500">Not quite!</div>
            <p className="opacity-90">{lastResult.reason}</p>
          </div>
        </div>
      )}

      {/* Forfeit Confirmation Safeguard Modal */}
      {showForfeitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
              isDark 
                ? 'bg-[#181d2c] border-[#313a57] text-white' 
                : 'bg-white border-amber-200 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5 text-rose-500 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg">
                Reveal Safeguard
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm leading-relaxed opacity-85 mb-4">
              &quot;Are you sure? I&apos;d really encourage you to use your remaining guesses or reveal one of the clues instead of giving up!&quot;
              <br /><br />
              Revealing will forfeit your chance to earn points for Edition #{question.edition}.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowForfeitModal(false)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border ${
                  isDark 
                    ? 'border-[#374163] hover:bg-[#252c44]' 
                    : 'border-stone-300 hover:bg-stone-100'
                }`}
              >
                Keep Trying
              </button>
              <button
                onClick={handleConfirmForfeit}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-md"
              >
                Yes, Reveal Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
