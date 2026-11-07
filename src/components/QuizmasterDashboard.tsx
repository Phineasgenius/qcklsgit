'use client';

import React, { useState } from 'react';
import { Question, HintTier } from '@/types';
import { 
  getStoredQuestions, 
  saveStoredQuestions, 
  setActiveQuestionId, 
  getActiveQuestionId,
  getStoredSubmissions
} from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';
import { 
  ShieldCheck, 
  PlusCircle, 
  UploadCloud, 
  CheckCircle, 
  Sparkles, 
  FileText, 
  Trash2, 
  X,
  History,
  Layers,
  HelpCircle
} from 'lucide-react';

interface QuizmasterDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionActivated: () => void;
}

export function QuizmasterDashboard({
  isOpen,
  onClose,
  onQuestionActivated,
}: QuizmasterDashboardProps) {
  const { isDark } = useTheme();

  const [questions, setQuestions] = useState<Question[]>(() => getStoredQuestions());
  const [activeQId, setActiveQIdState] = useState<string>(() => getActiveQuestionId());
  const [activeTab, setActiveTab] = useState<'manage' | 'new' | 'submissions'>('manage');

  // Form State
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [hintCount, setHintCount] = useState<1 | 2 | 3>(3);
  const [hintDifficult, setHintDifficult] = useState('');
  const [hintMedium, setHintMedium] = useState('');
  const [hintEasy, setHintEasy] = useState('');
  const [answer, setAnswer] = useState('');
  const [fundaKeywords, setFundaKeywords] = useState('');
  const [isFunda, setIsFunda] = useState(true);
  const [formMsg, setFormMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !questionText.trim() || !answer.trim()) {
      setFormMsg('Please fill in title, question text, and canonical answer.');
      return;
    }

    const currentQuestions = getStoredQuestions();
    const nextEdition = currentQuestions.length > 0 
      ? Math.max(...currentQuestions.map(q => q.edition)) + 1 
      : 1;

    const newQ: Question = {
      id: `q-${Date.now()}`,
      edition: nextEdition,
      title: title.trim(),
      questionText: questionText.trim(),
      hints: {
        difficult: hintDifficult.trim() || undefined,
        medium: hintCount >= 2 ? (hintMedium.trim() || undefined) : undefined,
        easy: hintCount === 3 ? (hintEasy.trim() || undefined) : undefined,
      },
      answer: answer.trim(),
      fundaKeywords: fundaKeywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean),
      isFunda,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const updated = [newQ, ...currentQuestions];
    saveStoredQuestions(updated);
    setQuestions(updated);

    // Reset Form
    setTitle('');
    setQuestionText('');
    setHintDifficult('');
    setHintMedium('');
    setHintEasy('');
    setAnswer('');
    setFundaKeywords('');
    setFormMsg('Question added successfully to the repository!');
    setActiveTab('manage');
  };

  const handleUploadQOTD = (questionId: string) => {
    setActiveQuestionId(questionId);
    setActiveQIdState(questionId);
    setQuestions(getStoredQuestions());
    onQuestionActivated();
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Delete this question from repository?')) {
      const updated = questions.filter(q => q.id !== id);
      saveStoredQuestions(updated);
      setQuestions(updated);
    }
  };

  const submissions = getStoredSubmissions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDark 
            ? 'bg-[#151928] border-[#29324c] text-white shadow-black/80' 
            : 'bg-white border-[#e3d7c3] text-stone-900 shadow-stone-200'
        }`}
      >
        {/* Header */}
        <div 
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark 
              ? 'bg-[#111422] border-[#232a40]' 
              : 'bg-[#faf5ec] border-[#ecdfcc]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-xl tracking-tight flex items-center gap-2">
                <span>Quizmaster Console</span>
                <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2 py-0.5 rounded font-bold">
                  Phineas
                </span>
              </h3>
              <p className="text-xs opacity-75 font-serif italic">
                Dump questions, configure hints (1-3), and upload Question of the Day
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark 
                ? 'border-[#2c334b] hover:bg-[#20263b] text-slate-400' 
                : 'border-stone-300 hover:bg-stone-100 text-stone-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className={`px-6 py-2 border-b flex items-center gap-2 text-xs font-semibold ${
            isDark ? 'border-[#22283d] bg-[#121524]' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'manage'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Repository ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'new'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Dump / Add New Question</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'submissions'
                ? 'bg-amber-500 text-black font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Submissions Log ({submissions.length})</span>
          </button>
        </div>

        {/* Tab 1: Question Repository (Upload / Active Toggle) */}
        {activeTab === 'manage' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>Choose any question and click &quot;Upload / Make Active&quot; to publish as Question of the Day.</span>
              <span className="font-mono font-bold text-amber-500">Active: Edition #{questions.find(q => q.id === activeQId)?.edition || '?'}</span>
            </div>

            <div className="space-y-3">
              {questions.map((q) => {
                const isActive = q.id === activeQId;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-[#1e263d] border-amber-500/60 shadow-lg shadow-amber-500/5'
                          : 'bg-amber-50 border-amber-400 shadow-sm'
                        : isDark
                        ? 'bg-[#181d2e] border-[#293149]'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            EDITION #{q.edition}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>LIVE QUESTION OF THE DAY</span>
                            </span>
                          )}
                          {q.isFunda && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40">
                              FUNDA
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif font-bold text-base mt-1">
                          {q.title}
                        </h4>

                        <p className="text-xs opacity-80 leading-relaxed font-serif line-clamp-2">
                          {q.questionText}
                        </p>

                        <div className="pt-2 flex items-center gap-3 text-[11px] opacity-75 font-mono">
                          <span>Answer: <strong>{q.answer}</strong></span>
                          <span>•</span>
                          <span>
                            Hints: {[q.hints.difficult, q.hints.medium, q.hints.easy].filter(Boolean).length} configured
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive ? (
                          <button
                            onClick={() => handleUploadQOTD(q.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Upload / Make Active</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-amber-500 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            Active
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete question"
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Dump New Question (1-3 hints selectable) */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateQuestion} className="overflow-y-auto p-6 flex-1 space-y-4">
            {formMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {formMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Question Title / Theme
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Belagavi Accord or The Enigma Cipher"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Number of Hints (1 - 3 chosen by Quizmaster)
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setHintCount(n)}
                      className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        hintCount === n
                          ? 'bg-amber-500 text-black border-amber-500'
                          : isDark
                          ? 'border-[#2d354e] text-slate-300'
                          : 'border-stone-300 text-stone-700'
                      }`}
                    >
                      {n} {n === 1 ? 'Hint' : 'Hints'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Question Text (Question on the top)
              </label>
              <textarea
                required
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Write the full question or daily trivia prompt..."
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                }`}
              />
            </div>

            {/* Hint Tier 1: Difficult */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                <span>Hint 1 • Toughest / Difficult Hint (Fetches 90 pts)</span>
                <span className="font-mono text-[10px]">Tier 1</span>
              </label>
              <input
                type="text"
                required
                value={hintDifficult}
                onChange={(e) => setHintDifficult(e.target.value)}
                placeholder="The hardest subtle clue..."
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                }`}
              />
            </div>

            {/* Hint Tier 2: Medium (if count >= 2) */}
            {hintCount >= 2 && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>Hint 2 • Medium Hint (Fetches 70 pts)</span>
                  <span className="font-mono text-[10px]">Tier 2</span>
                </label>
                <input
                  type="text"
                  required
                  value={hintMedium}
                  onChange={(e) => setHintMedium(e.target.value)}
                  placeholder="A clearer historical or conceptual angle..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>
            )}

            {/* Hint Tier 3: Easy (if count === 3) */}
            {hintCount === 3 && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Hint 3 • Easiest Hint (Fetches 50 pts)</span>
                  <span className="font-mono text-[10px]">Tier 3</span>
                </label>
                <input
                  type="text"
                  required
                  value={hintEasy}
                  onChange={(e) => setHintEasy(e.target.value)}
                  placeholder="The most direct pointer or almost giveaway clue..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Canonical Answer
                </label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. Mahatma Gandhi or Schrödinger's Cat"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Funda Keywords (comma-separated for close-enough checking)
                </label>
                <input
                  type="text"
                  value={fundaKeywords}
                  onChange={(e) => setFundaKeywords(e.target.value)}
                  placeholder="e.g. gandhi, 1924, belgaum, congress, veera soudha"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-[#191e2e] border-[#2c354e] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="fundaToggle"
                checked={isFunda}
                onChange={(e) => setIsFunda(e.target.checked)}
                className="rounded border-stone-400 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="fundaToggle" className="text-xs font-semibold cursor-pointer">
                Enable &quot;Give Funda&quot; fuzzy matching (allows conceptually close answers)
              </label>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Question to Dump</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Submissions Log */}
        {activeTab === 'submissions' && (
          <div className="overflow-y-auto p-6 flex-1 space-y-3">
            {submissions.length === 0 ? (
              <div className="text-center py-12 opacity-60 font-serif italic text-sm">
                No participant submissions recorded yet.
              </div>
            ) : (
              submissions.slice().reverse().map((sub) => (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    sub.isCorrect
                      ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                      : isDark ? 'bg-[#181c2b] border-[#293046]' : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-2">
                      <span>{sub.userName}</span>
                      <span className="font-mono text-[10px] text-amber-500 opacity-80">({sub.userUid})</span>
                      {sub.isCorrect ? (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Correct (+{sub.pointsAwarded}★)</span>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-bold">✗ Incorrect</span>
                      )}
                    </div>
                    <div className="font-mono opacity-80">
                      Guess: &quot;{sub.guess}&quot;
                    </div>
                    {sub.matchFeedback && (
                      <div className="text-[10px] opacity-70 italic">
                        {sub.matchFeedback} (Confidence: {Math.round(sub.matchScore * 100)}%)
                      </div>
                    )}
                  </div>

                  <div className="text-right font-mono text-[10px] opacity-60">
                    {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
