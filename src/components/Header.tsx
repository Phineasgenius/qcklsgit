'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  Trophy, 
  HelpCircle, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  LogOut,
  BookOpen,
  Award
} from 'lucide-react';

interface HeaderProps {
  editionNumber: number;
  onOpenHowToPlay: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenQMConsole: () => void;
}

export function Header({
  editionNumber,
  onOpenHowToPlay,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenQMConsole,
}: HeaderProps) {
  const { currentUser, isQM, logout } = useAuth();
  const { isDark } = useTheme();

  const todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="w-full">
      {/* Top Editorial Ribbon */}
      <div 
        className={`px-4 py-1.5 text-[11px] font-medium tracking-wide flex items-center justify-between border-b ${
          isDark 
            ? 'bg-[#0f1118] border-[#222738] text-slate-400' 
            : 'bg-[#ede7dc] border-[#e0d6c5] text-stone-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-semibold text-amber-500">Karnatak Law Society</span>
          <span className="opacity-40">•</span>
          <span>Gogte Institute of Technology, Belagavi</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-amber-500/90 font-bold">EDITION #{editionNumber}</span>
          <span className="opacity-40 hidden sm:inline">•</span>
          <span className="hidden sm:inline">{todayDateFormatted}</span>
        </div>
      </div>

      {/* Main Masthead */}
      <div 
        className={`px-4 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b ${
          isDark 
            ? 'border-[#262c3f]' 
            : 'border-[#e4dcce]'
        }`}
      >
        {/* Brand Title */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <span>QUIZ CLUB</span>
                <span className="text-amber-500 font-sans text-xs uppercase px-2 py-0.5 rounded-md font-bold tracking-widest bg-amber-500/10 border border-amber-500/30">
                  KLS GIT
                </span>
              </h1>
              <p className="text-[12px] opacity-75 font-serif italic tracking-wide -mt-0.5">
                The Daily Funda & Question of the Day
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* How to Play */}
          <button
            onClick={onOpenHowToPlay}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isDark 
                ? 'bg-[#1e2335] border-[#313954] hover:bg-[#282f48] text-slate-200' 
                : 'bg-white border-[#dcd3c2] hover:bg-stone-50 text-stone-800 shadow-sm'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Rules</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isDark 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-amber-50 border-amber-300/80 text-amber-900 hover:bg-amber-100 shadow-sm'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Leaderboard</span>
          </button>

          {/* Quizmaster Console Link */}
          {isQM ? (
            <button
              onClick={onOpenQMConsole}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-900/20 hover:brightness-110 border border-purple-400/30"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>QM Console</span>
            </button>
          ) : (
            <button
              onClick={onOpenQMConsole}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all opacity-80 hover:opacity-100 ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Quizmaster Login"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">QM</span>
            </button>
          )}

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div 
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
                  isDark 
                    ? 'bg-[#181d2e] border-amber-500/30 text-amber-300' 
                    : 'bg-white border-amber-200 text-amber-900 shadow-sm'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-[11px] leading-tight truncate max-w-[90px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] font-mono opacity-80 -mt-0.5">
                    {currentUser.uid}
                  </div>
                </div>
                {currentUser.role === 'user' && (
                  <div className="ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px]">
                    {currentUser.points}★
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark 
                    ? 'bg-[#181d2e] border-[#2d344d] text-slate-400 hover:text-red-400' 
                    : 'bg-white border-[#dcd3c2] text-stone-500 hover:text-red-600 shadow-sm'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all bg-amber-500 text-black hover:bg-amber-400 shadow-sm shadow-amber-500/30"
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
