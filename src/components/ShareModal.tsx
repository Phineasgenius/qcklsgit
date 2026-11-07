'use client';

import React, { useState } from 'react';
import { Question, HintTier } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Share2, Check, Copy, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  pointsAwarded: number;
  hintsUsed: HintTier[];
}

export function ShareModal({
  isOpen,
  onClose,
  question,
  pointsAwarded,
  hintsUsed,
}: ShareModalProps) {
  const { currentUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const clueBoxes = [
    hintsUsed.includes('difficult') ? '🟥' : '⬛',
    hintsUsed.includes('medium') ? '🟨' : '⬛',
    hintsUsed.includes('easy') ? '🟩' : '⬛',
  ].join(' ');

  const shareText = `🏛️ Quiz Club KLS GIT • Edition #${question.edition}
⭐ Solved for ${pointsAwarded} / 100 Points!
🔍 Clues: ${clueBoxes}
👤 Quizzed by: ${currentUser?.name || 'KLS GIT Member'} (${currentUser?.uid || 'Student'})
🎯 Question of the Day: https://qcklsgit.vercel.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--ink)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--yellow)] border-[1.5px] border-[var(--ink)] flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[var(--ink)]" />
            </div>
            <h3 className="text-lg font-black text-[var(--ink)]">
              Share Score Card
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]"
          >
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Card */}
        <div className="p-4 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] font-mono text-xs leading-relaxed whitespace-pre-wrap select-all shadow-[2px_2px_0_var(--ink)] text-[var(--ink)] font-semibold">
          {shareText}
        </div>

        <button
          onClick={handleCopy}
          className="btn-neo btn-neo-primary w-full !py-3 text-xs flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Score Card</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
