'use client';

import React, { useState, useEffect } from 'react';
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

export default function HomePage() {
  const { isQM, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');
  const [question, setQuestion] = useState<Question>(() => getActiveQuestion());

  // Modal states
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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
      setIsAuthOpen(true);
    }
  };

  const handleOpenShare = (points: number, hints: HintTier[]) => {
    setSharePoints(points);
    setShareHints(hints);
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 w-full">
        {/* Crisp Masthead Header */}
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
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
                K/D: {currentUser.wrongCount === 0 ? currentUser.correctCount : (currentUser.correctCount / currentUser.wrongCount).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <main className="w-full">
          {activeTab === 'quiz' ? (
            <QuestionCard
              question={question}
              onOpenShareModal={handleOpenShare}
            />
          ) : (
            <LeaderboardView />
          )}
        </main>
      </div>

      {/* Crisp Neobrutalist Footer */}
      <footer className="w-full border-t-[2.5px] border-[var(--ink)] bg-[var(--paper-deep)] py-6 px-4 text-xs font-semibold mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-[var(--ink)]">
            <strong>Quiz Club KLS GIT</strong> • Karnatak Law Society&apos;s Gogte Institute of Technology, Belagavi
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
        initialTab="user"
        onLoginSuccess={() => {
          refreshActiveQuestion();
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
