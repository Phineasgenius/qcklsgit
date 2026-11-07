'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { 
  getStoredQuestions, 
  saveStoredQuestions, 
  setActiveQuestionId, 
  getActiveQuestionId,
  getStoredSubmissions
} from '@/lib/storage';
import { 
  ShieldCheck, 
  PlusCircle, 
  UploadCloud, 
  CheckCircle, 
  Trash2, 
  X,
  History,
  Layers
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
      setFormMsg('Please fill in title, question text, and answer.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-4xl max-h-[92vh] flex flex-col bg-[var(--bg-secondary)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b-[2.5px] border-[var(--ink)] flex items-center justify-between bg-[var(--paper-deep)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
              <ShieldCheck className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--ink)] flex items-center gap-2">
                <span>Quizmaster Console</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--red)] text-white border-[1.5px] border-[var(--ink)]">
                  Phineas
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Draft questions with 1-3 hints, click upload to set Question of the Day
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper)]"
          >
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 border-b-[2px] border-[var(--ink)] flex items-center gap-2 bg-[var(--paper)]">
          <button
            onClick={() => setActiveTab('manage')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'manage' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Repository ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'new' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add / Dump Question</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'submissions' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Submissions ({submissions.length})</span>
          </button>
        </div>

        {/* Tab 1: Repository & Upload */}
        {activeTab === 'manage' && (
          <div className="overflow-y-auto p-5 flex-1 space-y-3">
            {questions.map((q) => {
              const isActive = q.id === activeQId;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border-[2px] border-[var(--ink)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isActive ? 'bg-[var(--yellow)]/20 shadow-[4px_4px_0_var(--ink)]' : 'bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--ink)]'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[var(--paper-deep)] border-[1.5px] border-[var(--ink)]">
                        EDITION #{q.edition}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--teal)] text-[var(--ink)] border-[1.5px] border-[var(--ink)]">
                          ● ACTIVE QUESTION OF THE DAY
                        </span>
                      )}
                      {q.isFunda && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[var(--lilac)] text-[var(--ink)] border-[1.5px] border-[var(--ink)]">
                          FUNDA
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-base text-[var(--ink)]">
                      {q.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 font-medium">
                      {q.questionText}
                    </p>
                    <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                      Answer: <strong>{q.answer}</strong> • Hints: {[q.hints.difficult, q.hints.medium, q.hints.easy].filter(Boolean).length} configured
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => handleUploadQOTD(q.id)}
                        className="btn-neo btn-neo-primary !py-1.5 !px-3 text-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload (Make Active)</span>
                      </button>
                    ) : (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--teal)] text-[var(--ink)] border-[1.5px] border-[var(--ink)]">
                        Active Today
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg border-[1.5px] border-[var(--ink)] text-[var(--red)] hover:bg-[var(--paper-deep)]"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: New Question Form */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateQuestion} className="overflow-y-auto p-5 flex-1 space-y-4">
            {formMsg && (
              <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--teal)]/20 text-xs font-bold text-[var(--ink)]">
                {formMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Question Title / Topic
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Belagavi Accord"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Number of Hints (1 - 3 chosen by Quizmaster)
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setHintCount(n)}
                      className={`flex-1 py-1.5 rounded-xl border-[2px] border-[var(--ink)] text-xs font-black transition-all ${
                        hintCount === n ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]' : 'bg-[var(--paper)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {n} {n === 1 ? 'Hint' : 'Hints'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                Question Text (Question on the top)
              </label>
              <textarea
                required
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Write the full question prompt..."
                className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium"
              />
            </div>

            {/* Hint Tier 1 */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--coral)]">
                Hint 1 • Toughest Hint (Drops max score to 90★)
              </label>
              <input
                type="text"
                required
                value={hintDifficult}
                onChange={(e) => setHintDifficult(e.target.value)}
                placeholder="The hardest clue..."
                className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium"
              />
            </div>

            {/* Hint Tier 2 */}
            {hintCount >= 2 && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--yellow)]">
                  Hint 2 • Medium Hint (Drops max score to 70★)
                </label>
                <input
                  type="text"
                  required
                  value={hintMedium}
                  onChange={(e) => setHintMedium(e.target.value)}
                  placeholder="Clearer contextual clue..."
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium"
                />
              </div>
            )}

            {/* Hint Tier 3 */}
            {hintCount === 3 && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--teal)]">
                  Hint 3 • Easiest Hint (Drops max score to 50★)
                </label>
                <input
                  type="text"
                  required
                  value={hintEasy}
                  onChange={(e) => setHintEasy(e.target.value)}
                  placeholder="The most direct pointer..."
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Canonical Answer
                </label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. Mahatma Gandhi"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Funda Keywords (comma-separated for close checking)
                </label>
                <input
                  type="text"
                  value={fundaKeywords}
                  onChange={(e) => setFundaKeywords(e.target.value)}
                  placeholder="e.g. gandhi, belgaum, congress, 1924"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-mono font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="fundaCheck"
                checked={isFunda}
                onChange={(e) => setIsFunda(e.target.checked)}
                className="w-4 h-4 rounded border-[2px] border-[var(--ink)] text-[var(--red)]"
              />
              <label htmlFor="fundaCheck" className="text-xs font-bold text-[var(--ink)] cursor-pointer">
                Enable &quot;Give Funda&quot; fuzzy matching (allows conceptually close answers)
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" className="btn-neo btn-neo-primary text-xs">
                Save to Question Dump
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Submissions */}
        {activeTab === 'submissions' && (
          <div className="overflow-y-auto p-5 flex-1 space-y-2">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No submissions recorded yet.
              </div>
            ) : (
              submissions.slice().reverse().map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs flex items-center justify-between shadow-[2px_2px_0_var(--ink)]"
                >
                  <div>
                    <div className="font-extrabold text-[var(--ink)] flex items-center gap-2">
                      <span>{sub.userName}</span>
                      <span className="font-mono text-[10px] text-[var(--red)]">({sub.userUid})</span>
                      {sub.isCorrect ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--teal)] border border-[var(--ink)]">
                          CORRECT (+{sub.pointsAwarded}★)
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--red)] text-white border border-[var(--ink)]">
                          WRONG
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Guess: &quot;{sub.guess}&quot;
                    </div>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)]">
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
