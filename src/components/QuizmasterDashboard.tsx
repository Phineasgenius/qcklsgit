'use client';

import React, { useState, useEffect } from 'react';
import { QMQuestion, QMUser, Submission } from '@/types';
import { apiFetch } from '@/lib/api';
import { 
  ShieldCheck, 
  PlusCircle, 
  UploadCloud, 
  Trash2, 
  X,
  History,
  Layers,
  Users as UsersIcon
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
  const [questions, setQuestions] = useState<QMQuestion[]>([]);
  const [users, setUsers] = useState<QMUser[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'new' | 'users' | 'submissions'>('manage');

  // Form State
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [hintCount, setHintCount] = useState<1 | 2 | 3>(3);
  const [hintDifficult, setHintDifficult] = useState('');
  const [hintMedium, setHintMedium] = useState('');
  const [hintEasy, setHintEasy] = useState('');
  const [answer, setAnswer] = useState('');
  const [funda, setFunda] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const activeQId = questions.find(q => q.status === 'active')?.id ?? null;

  const loadAll = async () => {
    setLoading(true);
    setPageError('');
    const [q, u, s] = await Promise.all([
      apiFetch<{ questions?: QMQuestion[] }>('/api/qm/questions'),
      apiFetch<{ users?: QMUser[] }>('/api/qm/users'),
      apiFetch<{ submissions?: Submission[] }>('/api/qm/submissions'),
    ]);
    if (q.ok) setQuestions(q.data.questions ?? []);
    if (u.ok) setUsers(u.data.users ?? []);
    if (s.ok) setSubmissions(s.data.submissions ?? []);
    const firstErr = [q, u, s].find(r => !r.ok);
    if (firstErr) setPageError(firstErr.data.error ?? 'Could not load data.');
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) loadAll();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg('');

    if (!title.trim()) return setFormMsg('Question title is empty. Please enter a title.');
    if (!questionText.trim()) return setFormMsg('Question text is empty. Please enter the question prompt.');
    if (!hintDifficult.trim()) return setFormMsg('Hint 1 is empty. Please provide at least the first clue.');
    if (hintCount >= 2 && !hintMedium.trim()) return setFormMsg('Hint 2 is empty. Please provide the medium clue.');
    if (hintCount === 3 && !hintEasy.trim()) return setFormMsg('Hint 3 is empty. Please provide the easiest clue.');
    if (!answer.trim()) return setFormMsg('Canonical answer is empty. Please provide the answer.');

    setSaving(true);
    const res = await apiFetch('/api/qm/questions', {
      method: 'POST',
      body: {
        title,
        questionText,
        hintDifficult,
        hintMedium: hintCount >= 2 ? hintMedium : '',
        hintEasy: hintCount === 3 ? hintEasy : '',
        answer,
        funda,
      },
    });
    setSaving(false);

    if (!res.ok) return setFormMsg(res.data.error ?? 'Could not save the question.');

    setTitle('');
    setQuestionText('');
    setHintDifficult('');
    setHintMedium('');
    setHintEasy('');
    setAnswer('');
    setFunda('');
    setFormMsg('');
    await loadAll();
    setActiveTab('manage');
  };

  const handleUploadQOTD = async (questionId: string) => {
    const res = await apiFetch(`/api/qm/questions/${questionId}`, { method: 'PATCH' });
    if (!res.ok) return setPageError(res.data.error ?? 'Could not activate the question.');
    await loadAll();
    onQuestionActivated();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question from repository?')) return;
    const res = await apiFetch(`/api/qm/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) return setPageError(res.data.error ?? 'Could not delete the question.');
    await loadAll();
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const pw = window.prompt(`Set a temporary password for ${userName} (min 6 characters). Tell them to change it on their profile page.`);
    if (pw === null) return;
    if (pw.length < 6) return setPageError('Password must be at least 6 characters.');
    const res = await apiFetch(`/api/qm/users/${userId}`, { method: 'PATCH', body: { password: pw } });
    if (!res.ok) return setPageError(res.data.error ?? 'Could not reset the password.');
    setPageError('');
    alert(`Password for ${userName} has been reset.`);
  };

  const handleDeleteUserAccount = async (userId: string, userName: string, userUid: string) => {
    if (!confirm(`Permanently delete account for ${userName} (${userUid})?`)) return;
    const res = await apiFetch(`/api/qm/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) return setPageError(res.data.error ?? 'Could not delete the user.');
    await loadAll();
  };

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
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Manage questions, upload Question of the Day, and manage accounts
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
        <div className="p-3 border-b-[2px] border-[var(--ink)] flex items-center gap-2 bg-[var(--paper)] flex-wrap">
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
            <span>Add Question</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'users' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Manage Users ({users.length})</span>
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

        {(pageError || loading) && (
          <div className={`mx-5 mt-4 p-3 rounded-xl border-[2px] border-[var(--ink)] text-xs font-bold text-[var(--ink)] ${pageError ? 'bg-[var(--red)]/20' : 'bg-[var(--paper-deep)]'}`}>
            {pageError || 'Loading…'}
          </div>
        )}

        {/* Tab 1: Repository & Upload */}
        {activeTab === 'manage' && (
          <div className="overflow-y-auto p-5 flex-1 space-y-3">
            {questions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                Repository is empty. Add a question using the &quot;Add Question&quot; tab.
              </div>
            ) : (
              questions.map((q) => {
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
                      </div>
                      <h4 className="font-extrabold text-base text-[var(--ink)]">
                        {q.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1 font-medium">
                        {q.questionText}
                      </p>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] font-semibold">
                        Answer: <strong>{q.answer}</strong>
                        {q.funda && <span> • Expected Funda: <em>{q.funda}</em></span>}
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
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Add Question Form (NO PLACEHOLDERS) */}
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
                  Question Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ledgers & Lakshmi"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-bold placeholder:text-[var(--text-muted)] placeholder:font-normal"
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
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Write the full question here…"
                className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Hint Tier 1 */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--coral)]">
                Hint 1 • Toughest Hint (Caps score at 90★)
              </label>
              <input
                type="text"
                value={hintDifficult}
                onChange={(e) => setHintDifficult(e.target.value)}
                placeholder="Hardest clue, barely gives it away"
                className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Hint Tier 2 */}
            {hintCount >= 2 && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--yellow)]">
                  Hint 2 • Medium Hint (Caps score at 70★)
                </label>
                <input
                  type="text"
                  value={hintMedium}
                  onChange={(e) => setHintMedium(e.target.value)}
                  placeholder="A clearer clue"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium placeholder:text-[var(--text-muted)]"
                />
              </div>
            )}

            {/* Hint Tier 3 */}
            {hintCount === 3 && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--teal)]">
                  Hint 3 • Easiest Hint (Caps score at 50★)
                </label>
                <input
                  type="text"
                  value={hintEasy}
                  onChange={(e) => setHintEasy(e.target.value)}
                  placeholder="Near-giveaway clue"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium placeholder:text-[var(--text-muted)]"
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
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="e.g. Muhurat Trading"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-bold placeholder:text-[var(--text-muted)] placeholder:font-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                  Expected Funda / Concept (also accepted if given)
                </label>
                <input
                  type="text"
                  value={funda}
                  onChange={(e) => setFunda(e.target.value)}
                  placeholder="e.g. Muhurat (also accepted)"
                  className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-medium placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={saving} className="btn-neo btn-neo-primary text-xs">
                {saving ? 'Saving…' : 'Save to Question Dump'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Manage Users (Admin Delete Feature) */}
        {activeTab === 'users' && (
          <div className="overflow-y-auto p-5 flex-1 space-y-3">
            <div className="text-xs font-bold text-[var(--text-secondary)] pb-2 border-b-[2px] border-[var(--ink)]">
              Registered Student Accounts ({users.length}) — Delete accounts when required.
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No registered student accounts found.
              </div>
            ) : (
              users.map((u) => {
                const cw = u.wrongCount === 0 ? u.correctCount : (u.correctCount / u.wrongCount).toFixed(2);
                return (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] flex items-center justify-between gap-3 shadow-[2px_2px_0_var(--ink)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg border-[1.5px] border-[var(--ink)] bg-[var(--yellow)] font-black text-sm flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[var(--ink)]">
                          {u.name}
                        </div>
                        <div className="font-mono text-xs text-[var(--red)] font-bold">
                          UID: {u.uid} • {u.points} ★ • {cw} CW ({u.correctCount}C / {u.wrongCount}W)
                        </div>
                        <div className="text-[11px] font-semibold text-[var(--text-secondary)]">
                          {u.designation ?? '—'} • {u.branch ?? '—'} • Year {u.year ?? '—'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResetPassword(u.id, u.name)}
                      className="btn-neo btn-neo-secondary !py-1.5 !px-3 text-xs"
                    >
                      <span>Reset Password</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUserAccount(u.id, u.name, u.uid)}
                      className="btn-neo btn-neo-secondary !py-1.5 !px-3 text-xs text-[var(--red)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete User</span>
                    </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 4: Submissions */}
        {activeTab === 'submissions' && (
          <div className="overflow-y-auto p-5 flex-1 space-y-2">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No submissions recorded yet.
              </div>
            ) : (
              submissions.map(sub => (
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
                      {sub.edition !== null && <span>Ed. #{sub.edition} • </span>}Guess: &quot;{sub.guess}&quot;
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
