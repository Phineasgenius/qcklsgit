'use client';

import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';
import { Trophy, Medal, X, Crosshair, Sparkles, UserCheck } from 'lucide-react';
import { User } from '@/types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const { isDark } = useTheme();
  const [boardData, setBoardData] = useState<(User & { kdRatio: number; rank: number })[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBoardData(getLeaderboard());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDark 
            ? 'bg-[#161a29] border-[#2c334b] text-white shadow-black/60' 
            : 'bg-white border-[#ebdcc7] text-stone-900 shadow-stone-200'
        }`}
      >
        {/* Header */}
        <div 
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark 
              ? 'bg-[#121522] border-[#252c42]' 
              : 'bg-[#faf6ee] border-[#ede3d2]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-xl tracking-tight flex items-center gap-2">
                <span>Quiz Club Leaderboard</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500 text-black px-2 py-0.5 rounded font-black tracking-wider">
                  KLS GIT
                </span>
              </h3>
              <p className="text-xs opacity-75 font-serif italic">
                Ranked by Stars & Question K/D (Correct / Wrong) Ratio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'border-[#2d344d] hover:bg-[#202538] text-slate-400' 
                : 'border-stone-300 hover:bg-stone-100 text-stone-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto p-4 md:p-6 flex-1">
          {boardData.length === 0 ? (
            <div className="text-center py-12 opacity-60 font-serif italic text-sm">
              No participants registered yet. Be the first to answer!
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2 text-[11px] font-mono uppercase tracking-wider opacity-60 border-b border-dashed border-stone-300 dark:border-slate-800">
                <span className="col-span-2">Rank</span>
                <span className="col-span-5">Member & UID</span>
                <span className="col-span-2 text-right">K / D Ratio</span>
                <span className="col-span-3 text-right">Total Score</span>
              </div>

              {boardData.map((player) => {
                const isTop1 = player.rank === 1;
                const isTop2 = player.rank === 2;
                const isTop3 = player.rank === 3;

                return (
                  <div
                    key={player.id}
                    className={`grid grid-cols-12 items-center px-4 py-3 rounded-2xl border transition-all ${
                      isTop1
                        ? isDark
                          ? 'bg-gradient-to-r from-amber-500/15 via-[#1a1f33] to-[#161a29] border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-amber-50/70 border-amber-300 shadow-sm'
                        : isDark
                        ? 'bg-[#1a1f33]/60 border-[#262c40] hover:bg-[#202740]'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 flex items-center gap-1.5 font-mono font-bold text-sm">
                      {isTop1 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black shadow-sm">
                          1
                        </span>
                      ) : isTop2 ? (
                        <span className="w-6 h-6 rounded-full bg-stone-300 text-stone-900 flex items-center justify-center text-xs font-black shadow-sm">
                          2
                        </span>
                      ) : isTop3 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-black shadow-sm">
                          3
                        </span>
                      ) : (
                        <span className="text-xs opacity-60 pl-2">
                          #{player.rank}
                        </span>
                      )}
                    </div>

                    {/* Member & College UID */}
                    <div className="col-span-5">
                      <div className="font-serif font-bold text-sm leading-snug flex items-center gap-1.5">
                        <span className="truncate">{player.name}</span>
                        {isTop1 && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="font-mono text-[11px] text-amber-500/90 font-medium tracking-wide">
                        {player.uid}
                      </div>
                    </div>

                    {/* K/D (Correct / Wrong) Ratio */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono font-bold text-xs flex items-center justify-end gap-1">
                        <Crosshair className="w-3 h-3 text-rose-400 opacity-70" />
                        <span>{player.kdRatio.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] opacity-60 font-mono">
                        {player.correctCount}C / {player.wrongCount}W
                      </div>
                    </div>

                    {/* Points / Stars */}
                    <div className="col-span-3 text-right">
                      <span className="font-mono text-base font-black text-amber-500">
                        {player.points}
                      </span>
                      <span className="text-xs font-bold text-amber-500 ml-0.5">★</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div 
          className={`px-6 py-3 border-t text-[11px] font-mono flex items-center justify-between opacity-70 ${
            isDark ? 'border-[#22283b] bg-[#111420]' : 'border-[#e8decd] bg-[#f8f4ec]'
          }`}
        >
          <span>K/D = Correct Answers ÷ Wrong Attempts</span>
          <span>Updated Live</span>
        </div>
      </div>
    </div>
  );
}
