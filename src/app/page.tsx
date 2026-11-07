'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AtmosphereBar } from '@/components/AtmosphereBar';
import { QuestionCard } from '@/components/QuestionCard';
import { CompanionWidget } from '@/components/CompanionWidget';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { AuthModal } from '@/components/AuthModal';
import { QuizmasterDashboard } from '@/components/QuizmasterDashboard';
import { ShareModal } from '@/components/ShareModal';
import { getActiveQuestion, getStoredQuestions } from '@/lib/storage';
import { Question, HintTier } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Trophy, BookOpen, Compass } from 'lucide-react';

export default function HomePage() {
  const { isQM, currentUser } = useAuth();

  const [question, setQuestion] = useState<Question>(() => getActiveQuestion());
  const [companionMsg, setCompanionMsg] = useState<string>('');
  
  // Modals state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQMConsoleOpen, setIsQMConsoleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Solved details for share card
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

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <Header
          editionNumber={question.edition}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenQMConsole={handleOpenQM}
        />

        {/* Atmosphere & Customization Bar */}
        <AtmosphereBar />

        {/* Main Content Workspace */}
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Welcome ribbon if user is logged in */}
          {currentUser && (
            <div className="mb-6 flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">● Active Session:</span>
                <span>{currentUser.name}</span>
                <span className="font-mono opacity-70">({currentUser.uid})</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-semibold">
                <span className="text-amber-500">{currentUser.points} ★ Points</span>
                <span className="opacity-40">•</span>
                <span>K/D: {currentUser.wrongCount === 0 ? currentUser.correctCount : (currentUser.correctCount / currentUser.wrongCount).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Core Question Card */}
          <QuestionCard
            question={question}
            onOpenShareModal={() => setIsShareOpen(true)}
            onCompanionMessage={(msg) => {
              setCompanionMsg(msg);
              setTimeout(() => setCompanionMsg(''), 6000);
            }}
          />
        </main>
      </div>

      {/* Editorial Footer */}
      <footer className="w-full border-t border-stone-200 dark:border-[#22283a] py-6 px-4 text-center text-xs opacity-75">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-serif">
          <div className="flex items-center gap-2">
            <span className="font-bold">Quiz Club KLS GIT</span>
            <span>•</span>
            <span className="italic">KLS Gogte Institute of Technology, Udyambag, Belagavi</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-sans">
            <button onClick={() => setIsHowToPlayOpen(true)} className="hover:underline">
              How to Play
            </button>
            <span>•</span>
            <button onClick={() => setIsLeaderboardOpen(true)} className="hover:underline">
              Leaderboard
            </button>
            <span>•</span>
            <button onClick={handleOpenQM} className="hover:underline">
              Quizmaster Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Companion Pet */}
      <CompanionWidget statusMessage={companionMsg} />

      {/* Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

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
