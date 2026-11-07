'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Trophy, 
  HelpCircle, 
  User as UserIcon, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut,
  Brain,
  ListOrdered
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'quiz' | 'leaderboard';
  onTabChange: (tab: 'quiz' | 'leaderboard') => void;
  onOpenHowToPlay: () => void;
  onOpenAuth: () => void;
  onOpenQMConsole: () => void;
}

export function Header({
  activeTab,
  onTabChange,
  onOpenHowToPlay,
  onOpenAuth,
  onOpenQMConsole,
}: HeaderProps) {
  const { currentUser, isQM, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b-[2.5px] border-[var(--ink)] pb-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Brand Group */}
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div 
            className="w-13 h-13 p-3 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--yellow)] flex items-center justify-center shadow-[3px_3px_0_var(--ink)] shrink-0"
          >
            <Brain className="w-7 h-7 text-[var(--ink)] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
                Quiz Club KLS GIT
              </h1>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[1.5px] border-[var(--ink)]">
                QCKLSGIT
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Karnatak Law Society&apos;s Gogte Institute of Technology • Question of the Day
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {/* Quiz / Leaderboard Tab Switcher */}
          <div className="inline-flex p-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)]">
            <button
              onClick={() => onTabChange('quiz')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] border-[1.5px] border-[var(--ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Today&apos;s Quiz
            </button>
            <button
              onClick={() => onTabChange('leaderboard')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] border-[1.5px] border-[var(--ink)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--ink)]'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Rules Button */}
          <button
            onClick={onOpenHowToPlay}
            className="btn-neo btn-neo-secondary !py-1.5 !px-3 text-xs"
            title="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Quizmaster Link */}
          {isQM ? (
            <button
              onClick={onOpenQMConsole}
              className="btn-neo btn-neo-primary !py-1.5 !px-3.5 text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>QM Console</span>
            </button>
          ) : (
            <button
              onClick={onOpenQMConsole}
              className="btn-neo btn-neo-secondary !py-1.5 !px-3 text-xs"
              title="Quizmaster Access"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--red)]" />
              <span className="hidden sm:inline">QM Portal</span>
            </button>
          )}

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className="btn-neo btn-neo-secondary !p-2 rounded-full"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--yellow)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--ink)]" />
            )}
          </button>

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)] text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--yellow)] border border-[var(--ink)] flex items-center justify-center text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-tight text-[11px] truncate max-w-[100px]">{currentUser.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono leading-none">{currentUser.uid}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[var(--yellow)] text-[var(--ink)] border border-[var(--ink)] font-mono text-[10px]">
                  {currentUser.points}★
                </span>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="btn-neo btn-neo-secondary !p-1.5 rounded-full text-[var(--red)]"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-neo btn-neo-yellow !py-1.5 !px-3.5 text-xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
