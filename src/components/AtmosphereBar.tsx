'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Sunset, Moon, Wind, HeartHandshake } from 'lucide-react';
import { ThemeMode, MotionSpeed, CompanionType } from '@/types';

export function AtmosphereBar() {
  const { theme, setTheme, motion, setMotion, companion, setCompanion, isDark } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'morning', label: 'Morning', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'golden', label: 'Golden Hour', icon: <Sunset className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'dusk', label: 'Dusk', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'midnight', label: 'Midnight', icon: <span className="text-xs">🌑</span> },
  ];

  const motions: { id: MotionSpeed; label: string }[] = [
    { id: 'calm', label: 'Calm' },
    { id: 'breeze', label: 'Breeze' },
    { id: 'gale', label: 'Gale' },
  ];

  const companions: { id: CompanionType; label: string; emoji: string }[] = [
    { id: 'cat', label: 'Cat', emoji: '🐱' },
    { id: 'dog', label: 'Dog', emoji: '🐶' },
    { id: 'owl', label: 'Owl', emoji: '🦉' },
    { id: 'none', label: 'Allergic', emoji: '🚫' },
  ];

  return (
    <div 
      className={`w-full border-y py-2 px-4 transition-colors text-xs flex flex-wrap items-center justify-between gap-3 ${
        isDark 
          ? 'bg-[#151722]/80 border-[#2b3047] text-slate-400' 
          : 'bg-[#f4efe6]/80 border-[#e3dac9] text-stone-600'
      }`}
    >
      {/* Atmosphere Theme Selector */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 mr-1 flex items-center gap-1">
          <Sun className="w-3 h-3" /> Backdrop:
        </span>
        <div className="inline-flex rounded-lg p-0.5 border border-amber-500/20 bg-black/5 dark:bg-white/5">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                theme === t.id
                  ? isDark 
                    ? 'bg-amber-400/20 text-amber-300 font-semibold shadow-sm border border-amber-400/30' 
                    : 'bg-white text-stone-900 font-semibold shadow-sm border border-amber-200'
                  : 'hover:text-amber-500'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Motion & Companion controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Motion Speed */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3" /> Motion:
          </span>
          <div className="inline-flex rounded-lg p-0.5 border border-slate-500/20 bg-black/5 dark:bg-white/5">
            {motions.map(m => (
              <button
                key={m.id}
                onClick={() => setMotion(m.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  motion === m.id
                    ? isDark 
                      ? 'bg-slate-700 text-slate-200 font-semibold' 
                      : 'bg-stone-200 text-stone-800 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Companion Picker */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3" /> Pet:
          </span>
          <div className="inline-flex rounded-lg p-0.5 border border-slate-500/20 bg-black/5 dark:bg-white/5">
            {companions.map(c => (
              <button
                key={c.id}
                onClick={() => setCompanion(c.id)}
                title={c.label}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  companion === c.id
                    ? isDark 
                      ? 'bg-amber-500/30 text-amber-300 font-semibold' 
                      : 'bg-amber-100 text-amber-900 font-semibold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span>{c.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
