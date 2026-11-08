'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HelpCircle, 
  User as UserIcon, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut,
  Trash2,
  AlertTriangle
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
  const { currentUser, isQM, logout, deleteMyAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteUserAccount = () => {
    deleteMyAccount();
    setShowDeleteConfirm(false);
  };

  return (
    <header className="border-b-[2.5px] border-[var(--ink)] pb-5 sm:pb-6 mb-6 sm:mb-8 w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 w-full">
        {/* Brand Group with Fluid Typography & Flexible Logo */}
        <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left justify-center sm:justify-start min-w-0">
          <div className="relative w-[clamp(44px,5vw,58px)] h-[clamp(44px,5vw,58px)] rounded-full border-[2.5px] border-[var(--ink)] bg-white overflow-hidden shadow-[3px_3px_0_var(--ink)] shrink-0 transition-transform">
            <Image
              src="/logo.png"
              alt="Quiz Club KLS GIT Logo"
              width={60}
              height={60}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h1 className="text-[clamp(1.25rem,2.5vw,1.95rem)] font-black tracking-tight text-[var(--ink)] leading-tight whitespace-normal">
                Quiz Club KLS GIT
              </h1>
              <span className="text-[clamp(9px,1vw,11px)] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[1.5px] border-[var(--ink)] shrink-0">
                QC
              </span>
            </div>
            <p className="text-[clamp(0.7rem,1.2vw,0.825rem)] text-[var(--text-secondary)] font-semibold mt-0.5 leading-snug">
              Question of the Day & Live Leaderboard
            </p>
          </div>
        </div>

        {/* Action Controls - Fluid & Flexible Wrap */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center lg:justify-end shrink-0">
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
              title="Quizmaster Portal"
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
              <Link
                href={currentUser.role === 'user' ? '/profile' : '/'}
                title={currentUser.role === 'user' ? 'My profile & stats' : undefined}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)] text-xs font-bold hover:bg-[var(--paper-deep)] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--yellow)] border border-[var(--ink)] flex items-center justify-center text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-tight text-[11px] truncate max-w-[100px]">{currentUser.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono leading-none">{currentUser.uid}</span>
                </div>
                {currentUser.role === 'user' && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--yellow)] text-[var(--ink)] border border-[var(--ink)] font-mono text-[10px]">
                    {currentUser.points}★
                  </span>
                )}
              </Link>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Sign out"
                className="btn-neo btn-neo-secondary !p-1.5 rounded-full"
              >
                <LogOut className="w-3.5 h-3.5 text-[var(--ink)]" />
              </button>

              {/* Delete User Account Button (for students) */}
              {currentUser.role === 'user' && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete my account"
                  className="btn-neo btn-neo-secondary !p-1.5 rounded-full text-[var(--red)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
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

      {/* Delete Account Confirmation Modal for User */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
            <div className="flex items-center gap-2 text-[var(--red)]">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              <h3 className="text-lg font-black text-[var(--ink)]">
                Delete Your Account?
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
              This will permanently delete your account, your UID record (<strong>{currentUser?.uid}</strong>), and all your quiz scores and submissions from the leaderboard. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-neo btn-neo-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUserAccount}
                className="btn-neo btn-neo-primary text-xs"
              >
                Yes, Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
