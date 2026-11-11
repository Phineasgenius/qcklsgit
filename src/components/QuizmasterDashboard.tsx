'use client';

import React, { useState, useEffect } from 'react';
import { HintTier, QMQuestion, QMUser, Submission } from '@/types';
import { apiFetch } from '@/lib/api';
import { 
  ShieldCheck, 
  PlusCircle, 
  UploadCloud, 
  Trash2, 
  X,
  History,
  Layers,
  Users as UsersIcon,
  Search,
  Check,
  Lightbulb,
  CalendarDays
} from 'lucide-react';

/** Today's date in IST as YYYY-MM-DD. */
function todayIST() {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

const HINT_CHIP: Record<HintTier, { label: string; cls: string }> = {
  difficult: { label: 'Hint 1', cls: 'bg-[var(--coral)]' },
  medium: { label: 'Hint 2', cls: 'bg-[var(--yellow)]' },
  easy: { label: 'Hint 3', cls: 'bg-[var(--teal)]' },
};

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
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');

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
    if (isOpen) {
      setSearch('');
      loadAll();
    }
  }, [isOpen]);

  const switchTab = (t: 'manage' | 'new' | 'users' | 'submissions') => {
    setSearch('');
    setActiveTab(t);
  };

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
        scheduledDate,
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
    setScheduledDate('');
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

  const handleOverride = async (sub: Submission) => {
    const next = !sub.isCorrect;
    const ok = confirm(
      next
        ? `Mark ${sub.userName}'s answer "${sub.guess}" as CORRECT?\n\nThey will get points based on the hints they used.`
        : `Mark ${sub.userName}'s answer "${sub.guess}" as WRONG?\n\nThe points from this answer will be removed.`
    );
    if (!ok) return;
    setBusyId(sub.id);
    const res = await apiFetch(`/api/qm/submissions/${sub.id}`, { method: 'PATCH', body: { isCorrect: next } });
    setBusyId(null);
    if (!res.ok) return setPageError(res.data.error ?? 'Could not update the submission.');
    setPageError('');
    await loadAll();
  };

  const term = search.trim().toLowerCase();
  const has = (...parts: (string | number | null | undefined)[]) =>
    parts.map((p) => String(p ?? '')).join(' ').toLowerCase().includes(term);

  const fq = term
    ? questions.filter((q) => has(q.title, q.questionText, q.answer, q.funda, q.status, q.edition, `#${q.edition}`, `ed ${q.edition}`))
    : questions;
  const fu = term
    ? users.filter((u) => has(u.name, u.uid, u.branch, u.year, u.designation, `${u.year} year`))
    : users;
  const fs = term
    ? submissions.filter((s) => has(s.userName, s.userUid, s.guess, s.edition, `#${s.edition}`, `ed ${s.edition}`, s.isCorrect ? 'correct' : 'wrong'))
    : submissions;

  const searchBar = (placeholder: string, shown: number, total: number) => (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--ink)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--bg-secondary)] text-xs font-semibold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--ink)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {term && (
        <div className="text-[11px] font-bold text-[var(--text-secondary)]">
          Showing {shown} of {total}
        </div>
      )}
    </div>
  );

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
            onClick={() => switchTab('manage')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'manage' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Repository ({questions.length})</span>
          </button>
          <button
            onClick={() => switchTab('new')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'new' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
          <button
            onClick={() => switchTab('users')}
            className={`btn-neo !py-1 !px-3 text-xs ${
              activeTab === 'users' ? 'btn-neo-yellow' : 'btn-neo-secondary'
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Manage Users ({users.length})</span>
          </button>
          <button
            onClick={() => switchTab('submissions')}
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
            {questions.length > 0 && searchBar('Search questions by title, text, answer or edition...', fq.length, questions.length)}
            {questions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                Repository is empty. Add a question using the &quot;Add Question&quot; tab.
              </div>
            ) : fq.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No questions match &quot;{search}&quot;.
              </div>
            ) : (
              fq.map((q) => {
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
                        {q.scheduledDate && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--lilac)] text-[var(--ink)] border-[1.5px] border-[var(--ink)] inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {isActive || q.status === 'archived' ? 'Date' : 'Goes live'}: {fmtDate(q.scheduledDate)}
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
                        hintCount === n ? 'bg-[var(--yellow)] text-[#1b1712] shadow-[2px_2px_0_var(--ink)]' : 'bg-[var(--paper)] text-[var(--text-secondary)]'
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

            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[var(--text-secondary)]">
                Goes live on (optional)
              </label>
              <input
                type="date"
                min={todayIST()}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs font-bold"
              />
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                Becomes the Question of the Day on this date (IST), when the first visitor loads the site. Leave empty to rotate in edition order or activate manually.
              </p>
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

            {users.length > 0 && searchBar('Search members by name, UID, branch, year or designation...', fu.length, users.length)}

            {users.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No registered student accounts found.
              </div>
            ) : fu.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No members match &quot;{search}&quot;.
              </div>
            ) : (
              fu.map((u) => {
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
            {submissions.length > 0 && searchBar('Search submissions by name, UID, answer, edition, correct/wrong...', fs.length, submissions.length)}
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No submissions recorded yet.
              </div>
            ) : fs.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
                No submissions match &quot;{search}&quot;.
              </div>
            ) : (
              fs.map(sub => {
                const busy = busyId === sub.id;
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-xs flex items-center justify-between gap-3 shadow-[2px_2px_0_var(--ink)]"
                  >
                    <div className="min-w-0">
                      <div className="font-extrabold text-[var(--ink)] flex items-center gap-2 flex-wrap">
                        <span>{sub.userName}</span>
                        <span className="font-mono text-[10px] text-[var(--red)]">({sub.userUid})</span>
                        {sub.forfeited ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--paper-deep)] border border-[var(--ink)]">
                            FORFEIT
                          </span>
                        ) : sub.isCorrect ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--teal)] border border-[var(--ink)]">
                            CORRECT (+{sub.pointsAwarded}★)
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--red)] text-white border border-[var(--ink)]">
                            WRONG
                          </span>
                        )}
                        {sub.overridden && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--lilac)] border border-[var(--ink)]">
                            EDITED BY QM
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--text-secondary)] mt-0.5 break-words">
                        {sub.edition !== null && <span>Ed. #{sub.edition} • </span>}
                        Attempt {sub.attemptNo} • Guess: &quot;{sub.guess}&quot;
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Lightbulb className="w-3.5 h-3.5 text-[var(--ink)]" />
                        <span className="text-[10px] font-black uppercase text-[var(--text-secondary)]">
                          Hints used: {sub.hintsUsed.length}
                        </span>
                        {sub.hintsUsed.map((h) => (
                          <span
                            key={h}
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded border border-[var(--ink)] text-[var(--ink)] ${HINT_CHIP[h].cls}`}
                          >
                            {HINT_CHIP[h].label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="font-mono text-[10px] text-[var(--text-muted)]">
                        {new Date(sub.timestamp).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {!sub.forfeited && (
                        <button
                          onClick={() => handleOverride(sub)}
                          disabled={busy}
                          className={`btn-neo btn-neo-secondary !py-1 !px-2.5 text-[11px] ${sub.isCorrect ? 'text-[var(--red)]' : ''}`}
                        >
                          {sub.isCorrect ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          <span>{busy ? 'Saving…' : sub.isCorrect ? 'Mark wrong' : 'Mark correct'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}