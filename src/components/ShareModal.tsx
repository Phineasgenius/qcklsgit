'use client';

import React, { useState } from 'react';
import { Question, HintTier } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Share2, Check, Copy, X, Sparkles } from 'lucide-react';

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
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build grid representation:
  // Difficult clue: 🟥 if used, ⬛ if not
  // Medium clue: 🟨 if used, ⬛ if not
  // Easy clue: 🟩 if used, ⬛ if not
  const clueBoxes = [
    hintsUsed.includes('difficult') ? '🟥' : '⬛',
    hintsUsed.includes('medium') ? '🟨' : '⬛',
    hintsUsed.includes('easy') ? '🟩' : '⬛',
  ].join(' ');

  const shareText = `🏛️ Quiz Club KLS GIT • Edition #${question.edition}
⭐ Cracked for ${pointsAwarded} / 100 Points!
🔍 Clues: ${clueBoxes}
👤 Quizzed by: ${currentUser?.name || 'A KLS GIT Scholar'} (${currentUser?.uid || '25u0101'})
🎯 Play Question of the Day: https://qcklsgit.vercel.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDark 
            ? 'bg-[#161a29] border-[#2b334c] text-white shadow-black/80' 
            : 'bg-white border-[#ebdcc7] text-stone-900 shadow-stone-200'
        }`}
      >
        {/* Header */}
        <div 
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'bg-[#111422] border-[#232a40]' : 'bg-[#faf6ee] border-[#ede3d2]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg tracking-tight">
                Share Daily Score
              </h3>
              <p className="text-[11px] opacity-75 font-serif italic">
                Edition #{question.edition} • Quiz Club KLS GIT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-all ${
              isDark ? 'border-[#2d344d] hover:bg-[#202538] text-slate-400' : 'border-stone-300 hover:bg-stone-100 text-stone-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4">
          <div 
            className={`p-4 rounded-2xl border font-mono text-xs leading-relaxed whitespace-pre-wrap select-all ${
              isDark ? 'bg-[#111422] border-[#252c40] text-amber-200' : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            {shareText}
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Share Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
