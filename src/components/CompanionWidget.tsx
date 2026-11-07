'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sparkles, MessageCircle } from 'lucide-react';

interface CompanionWidgetProps {
  statusMessage?: string;
}

export function CompanionWidget({ statusMessage }: CompanionWidgetProps) {
  const { companion, setCompanion, theme } = useTheme();
  const [showBubble, setShowBubble] = useState(false);

  if (companion === 'none') return null;

  const isDark = theme === 'dusk' || theme === 'midnight';

  const defaultDialogue = {
    cat: 'Purr... trust your instincts!',
    dog: 'Woof! You can crack this clue!',
    owl: 'Hoo-hoo... think deep, quizzing scholar!',
  }[companion] || 'Let’s quiz!';

  const textToDisplay = statusMessage || defaultDialogue;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end gap-2 group select-none">
      {/* Speech bubble */}
      <div 
        className={`transition-all duration-300 max-w-xs px-3.5 py-2 rounded-2xl text-xs font-medium shadow-lg border relative ${
          showBubble || statusMessage
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0'
        } ${
          isDark 
            ? 'bg-[#1e2336] border-[#363d5c] text-amber-200' 
            : 'bg-white border-amber-200 text-amber-900 shadow-amber-50'
        }`}
      >
        <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>Quiz Companion</span>
        </div>
        <p className="leading-snug">{textToDisplay}</p>
        {/* Tail */}
        <div 
          className={`w-2.5 h-2.5 rotate-45 absolute -bottom-1.5 right-6 border-r border-b ${
            isDark ? 'bg-[#1e2336] border-[#363d5c]' : 'bg-white border-amber-200'
          }`}
        />
      </div>

      {/* Interactive Avatar button */}
      <button
        onClick={() => setShowBubble(prev => !prev)}
        title={`Companion: ${companion} (Click to interact)`}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
          isDark 
            ? 'bg-[#22273d] border-amber-500/40 text-amber-400 hover:border-amber-400' 
            : 'bg-white border-amber-400/60 text-amber-600 hover:border-amber-500 shadow-amber-100'
        }`}
      >
        {companion === 'cat' && '🐱'}
        {companion === 'dog' && '🐶'}
        {companion === 'owl' && '🦉'}
      </button>
    </div>
  );
}
