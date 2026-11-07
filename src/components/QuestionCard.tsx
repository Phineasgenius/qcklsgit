'use client';

import React, { useState } from 'react';
import { Question, HintTier, Submission } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { ClueStack } from './ClueStack';
import { AnswerSection } from './AnswerSection';
import { Sparkles, HelpCircle, Flame, Calendar, Award } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onOpenShareModal: () => void;
  onCompanionMessage?: (msg: string) => void;
}

export function QuestionCard({
  question,
  onOpenShareModal,
  onCompanionMessage,
}: QuestionCardProps) {
  const { isDark } = useTheme();
  const [unlockedHints, setUnlockedHints] = useState<HintTier[]>([]);

  const handleUnlockHint = (tier: HintTier) => {
    if (!unlockedHints.includes(tier)) {
      setUnlockedHints(prev => [...prev, tier]);
      if (onCompanionMessage) {
        onCompanionMessage(
          tier === 'difficult'
            ? 'Toughest clue unlocked. Max points now 90 ★.'
            : tier === 'medium'
            ? 'Medium clue revealed. Max points now 70 ★.'
            : 'Easiest clue opened. Max points now 50 ★.'
        );
      }
    }
  };

  return (
    <div 
      className={`w-full max-w-3xl mx-auto rounded-3xl border shadow-xl transition-all duration-300 overflow-hidden ${
        isDark 
          ? 'bg-[#181c2b] border-[#293046] shadow-black/40' 
          : 'bg-white border-[#e6decb] shadow-stone-200/50'
      }`}
    >
      {/* Question Header & Meta Bar */}
      <div 
        className={`px-6 py-4 border-b flex items-center justify-between gap-3 flex-wrap ${
          isDark 
            ? 'bg-[#141724] border-[#262d42]' 
            : 'bg-[#faf6ee] border-[#ede3d2]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/25">
            EDITION #{question.edition}
          </span>
          {question.isFunda && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/15 px-2.5 py-1 rounded-md border border-purple-500/30">
              <Sparkles className="w-3 h-3" />
              <span>GIVE FUNDA</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs opacity-75 font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>{question.date || 'Today’s Edition'}</span>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* 1. QUESTION ON THE TOP */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-amber-500">
            <Flame className="w-4 h-4" />
            <span>Question of the Day</span>
          </div>

          <h2 className="font-serif text-xl md:text-2xl font-bold leading-snug tracking-tight">
            {question.questionText}
          </h2>

          {question.isFunda && (
            <p className="text-xs italic opacity-80 font-serif border-l-2 border-purple-400 pl-3 py-0.5">
              💡 <strong>Funda Rules:</strong> Explain the key connection, name, or mechanism. Our smart evaluation engine accepts close enough answers and concept phrases!
            </p>
          )}
        </div>

        {/* 2. CLUE STACK (3 Hints: Difficult -> Medium -> Easy) */}
        <ClueStack
          question={question}
          unlockedHints={unlockedHints}
          onUnlockHint={handleUnlockHint}
        />

        {/* 3. ANSWER PLACEHOLDER & SUBMISSION */}
        <div className="pt-2 border-t border-dashed border-stone-200 dark:border-slate-800">
          <AnswerSection
            question={question}
            unlockedHints={unlockedHints}
            onOpenShareModal={onOpenShareModal}
            onCompanionMessage={onCompanionMessage}
          />
        </div>
      </div>
    </div>
  );
}
