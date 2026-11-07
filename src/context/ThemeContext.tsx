'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, MotionSpeed, CompanionType } from '@/types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  motion: MotionSpeed;
  setMotion: (m: MotionSpeed) => void;
  companion: CompanionType;
  setCompanion: (c: CompanionType) => void;
  isDark: boolean;
}

const THEME_KEY = 'qcklsgit_theme_mode';
const MOTION_KEY = 'qcklsgit_motion_mode';
const COMPANION_KEY = 'qcklsgit_companion_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('midnight');
  const [motion, setMotionState] = useState<MotionSpeed>('breeze');
  const [companion, setCompanionState] = useState<CompanionType>('cat');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (savedTheme) setThemeState(savedTheme);

      const savedMotion = localStorage.getItem(MOTION_KEY) as MotionSpeed | null;
      if (savedMotion) setMotionState(savedMotion);

      const savedCompanion = localStorage.getItem(COMPANION_KEY) as CompanionType | null;
      if (savedCompanion) setCompanionState(savedCompanion);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    // Apply dark class to html document
    if (t === 'dusk' || t === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setMotion = (m: MotionSpeed) => {
    setMotionState(m);
    localStorage.setItem(MOTION_KEY, m);
  };

  const setCompanion = (c: CompanionType) => {
    setCompanionState(c);
    localStorage.setItem(COMPANION_KEY, c);
  };

  useEffect(() => {
    if (theme === 'dusk' || theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isDark = theme === 'dusk' || theme === 'midnight';

  return (
    <ThemeContext.Provider value={{ theme, setTheme, motion, setMotion, companion, setCompanion, isDark }}>
      <div 
        className={`min-h-screen transition-colors duration-500 ${
          theme === 'morning'
            ? 'bg-[#faf8f5] text-[#2c2c2c]'
            : theme === 'golden'
            ? 'bg-[#fef7ee] text-[#2d241e]'
            : theme === 'dusk'
            ? 'bg-[#181b2a] text-[#f1f5f9]'
            : 'bg-[#121212] text-[#f4f4f5]'
        }`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
