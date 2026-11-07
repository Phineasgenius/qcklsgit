'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { HelpCircle, Star, Crosshair, Sparkles, X, ShieldAlert } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative ${
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
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg tracking-tight">
                How to Play • Rules of Engagement
              </h3>
              <p className="text-[11px] opacity-75 font-serif italic">
                Quiz Club KLS GIT Daily Trivia & Funda System
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed">
          {/* Rule 1: Point Economy */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-amber-500 flex items-center gap-1.5 text-sm uppercase tracking-wide">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>1. The Star & Points Economy</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="text-lg font-black text-amber-500">100 ★</div>
                <div className="text-[10px] opacity-75 font-sans mt-0.5">No Hints Used</div>
              </div>
              <div className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10">
                <div className="text-lg font-black text-rose-400">90 ★</div>
                <div className="text-[10px] opacity-75 font-sans mt-0.5">Toughest Clue</div>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10">
                <div className="text-lg font-black text-amber-400">70 ★</div>
                <div className="text-[10px] opacity-75 font-sans mt-0.5">Medium Clue</div>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
                <div className="text-lg font-black text-emerald-400">50 ★</div>
                <div className="text-[10px] opacity-75 font-sans mt-0.5">Easiest Clue</div>
              </div>
            </div>
          </div>

          {/* Rule 2: Give Funda Engine */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-purple-400 flex items-center gap-1.5 text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>2. &quot;Give Funda&quot; Fuzzy Matching</span>
            </h4>
            <p className="opacity-80">
              Unlike strict automated word games, our system is built for true quizzers. For &quot;Give Funda&quot; questions, you don’t need an exact verbatim string. The system intelligently detects close answers, synonyms, key names, and fundamental concepts!
            </p>
          </div>

          {/* Rule 3: K/D Ratio on Leaderboard */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-rose-400 flex items-center gap-1.5 text-sm uppercase tracking-wide">
              <Crosshair className="w-4 h-4" />
              <span>3. K/D Ratio & Accuracy Tracking</span>
            </h4>
            <p className="opacity-80">
              Just like your favorite games, your profile tracks a <strong>K/D (Correct / Wrong) ratio</strong>. Every incorrect guess or forfeit adjusts your ratio, so weigh your answers carefully before submitting!
            </p>
          </div>

          {/* Rule 4: College UID Logins */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-blue-400 flex items-center gap-1.5 text-sm uppercase tracking-wide">
              <span>4. College ID Authentication</span>
            </h4>
            <p className="opacity-80">
              Students authenticate with their real full name and KLS GIT College UID (e.g. <code>25u0101</code>) printed on the ID badge. The Quizmaster operates from their dedicated portal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div 
          className={`p-4 border-t flex justify-end ${
            isDark ? 'border-[#22283d] bg-[#121524]' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md"
          >
            Got it, Let’s Play!
          </button>
        </div>
      </div>
    </div>
  );
}
