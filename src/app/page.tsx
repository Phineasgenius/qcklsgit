'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { QuestionCard } from '@/components/QuestionCard';
import { LeaderboardView } from '@/components/LeaderboardView';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { AuthModal } from '@/components/AuthModal';
import { QuizmasterDashboard } from '@/components/QuizmasterDashboard';
import { ShareModal } from '@/components/ShareModal';
import { getActiveQuestion } from '@/lib/storage';
import { Question, HintTier } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, Trophy, Flame } from 'lucide-react';

export default function HomePage() {
  const { isQM, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');
  const [question, setQuestion] = useState<Question>(() => getActiveQuestion());

  // Modal states
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'user' | 'register' | 'qm'>('user');
  const [isQMConsoleOpen, setIsQMConsoleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Share card details
  const [sharePoints, setSharePoints] = useState(100);
  const [shareHints, setShareHints] = useState<HintTier[]>([]);

  const refreshActiveQuestion = () => {
    setQuestion(getActiveQuestion());
  };

  useEffect(() => {
    refreshActiveQuestion();
  }, []);

  const handleOpenQM = () => {
    if (isQM) {
      setIsQMConsoleOpen(true);
    } else {
      setAuthTab('qm');
      setIsAuthOpen(true);
    }
  };

  const handleOpenAuth = (tab: 'user' | 'register' | 'qm' = 'user') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const handleOpenShare = (points: number, hints: HintTier[]) => {
    setSharePoints(points);
    setShareHints(hints);
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 w-full">
        {/* Crisp Masthead Header with Official Logo */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenAuth={() => handleOpenAuth('user')}
          onOpenQMConsole={handleOpenQM}
        />

        {/* Member Status Pill if logged in */}
        {currentUser && (
          <div className="mb-6 p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] shadow-[3px_3px_0_var(--ink)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--teal)] border border-[var(--ink)]" />
              <span className="font-extrabold text-[var(--ink)]">Signed in as {currentUser.name}</span>
              <span className="font-mono text-[var(--red)] font-bold">({currentUser.uid})</span>
            </div>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className="px-2 py-0.5 rounded bg-[var(--yellow)] text-[var(--ink)] border border-[var(--ink)]">
                {currentUser.points} ★ Points
              </span>
              <span className="text-[var(--text-secondary)]">
                CW: {currentUser.wrongCount === 0 ? currentUser.correctCount : (currentUser.correctCount / currentUser.wrongCount).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="w-full">
          {activeTab === 'leaderboard' ? (
            <LeaderboardView />
          ) : !currentUser ? (
            /* LANDING PAGE: ASK LOGIN OR SIGNUP */
            <div className="card-neo p-8 md:p-12 text-center bg-[var(--bg-secondary)] space-y-6">
              <div className="relative w-24 h-24 mx-auto rounded-full border-[3px] border-[var(--ink)] bg-white overflow-hidden shadow-[4px_4px_0_var(--ink)]">
                <Image
                  src="/logo.png"
                  alt="Quiz Club KLS GIT"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--yellow)] text-[var(--ink)] border-[1.5px] border-[var(--ink)] text-xs font-black uppercase">
                  <Flame className="w-3.5 h-3.5 fill-[var(--ink)]" />
                  <span>Edition #{question.edition} is Live</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
                  Welcome to Quiz Club KLS GIT
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] max-w-md mx-auto">
                  Please sign in with your college UID or register with your real name to solve today&apos;s question and compete on the leaderboard.
                </p>
              </div>

              {/* Login / Signup Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenAuth('user')}
                  className="btn-neo btn-neo-primary w-full sm:w-auto !py-3 !px-7 text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with UID</span>
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="btn-neo btn-neo-yellow w-full sm:w-auto !py-3 !px-7 text-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up (New Member)</span>
                </button>
              </div>

              {/* Secondary links */}
              <div className="pt-4 border-t-[2px] border-[var(--ink)] flex items-center justify-center gap-4 text-xs font-bold text-[var(--text-secondary)]">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-[var(--ink)] hover:underline flex items-center gap-1"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>View Leaderboard</span>
                </button>
                <span>•</span>
                <button
                  onClick={handleOpenQM}
                  className="hover:text-[var(--ink)] hover:underline"
                >
                  Quizmaster Access
                </button>
              </div>
            </div>
          ) : (
            /* Logged-in user sees Today's Quiz */
            <QuestionCard
              question={question}
              onOpenShareModal={handleOpenShare}
            />
          )}
        </main>
      </div>

      {/* Crisp Neobrutalist Footer */}
      <footer className="w-full border-t-[2.5px] border-[var(--ink)] bg-[var(--paper-deep)] py-6 px-4 text-xs font-semibold mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-[var(--ink)]">
            <strong>Quiz Club KLS GIT</strong> • Belagavi
          </div>
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <button onClick={() => setActiveTab('quiz')} className="hover:text-[var(--ink)] hover:underline">
              Today&apos;s Quiz
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('leaderboard')} className="hover:text-[var(--ink)] hover:underline">
              Leaderboard
            </button>
            <span>•</span>
            <button onClick={handleOpenQM} className="hover:text-[var(--ink)] hover:underline">
              QM Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        onLoginSuccess={() => {
          refreshActiveQuestion();
          setActiveTab('quiz');
        }}
      />

      <QuizmasterDashboard
        isOpen={isQMConsoleOpen}
        onClose={() => setIsQMConsoleOpen(false)}
        onQuestionActivated={() => {
          refreshActiveQuestion();
          setActiveTab('quiz');
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        question={question}
        pointsAwarded={sharePoints}
        hintsUsed={shareHints}
      />
    </div>
  );
}
