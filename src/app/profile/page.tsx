'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiFetch } from '@/lib/api';
import { HistoryItem, ProfileStats, User } from '@/types';
import { ProfileFields, ProfileValues } from '@/components/ProfileFields';
import { SecurityFields, SecurityValues } from '@/components/SecurityFields';
import { PasswordInput } from '@/components/PasswordInput';
import { ArrowLeft, Flame, Moon, Sun, Trophy, Target, CheckCircle2, XCircle, MinusCircle, Clock } from 'lucide-react';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal';
const labelCls = 'text-xs font-extrabold uppercase text-[var(--text-secondary)]';

function Notice({ kind, text }: { kind: 'ok' | 'err'; text: string }) {
  return (
    <div className={`p-3 rounded-xl border-[2px] border-[var(--ink)] text-xs font-bold text-[var(--ink)] ${kind === 'ok' ? 'bg-[var(--teal)]/20' : 'bg-[var(--red)]/20'}`}>{text}</div>
  );
}

function Stat({ label, value, sub, icon }: { label: string; value: React.ReactNode; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="card-neo !shadow-[4px_4px_0_var(--ink)] p-4 bg-[var(--bg-secondary)]">
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">{icon}{label}</div>
      <div className="font-mono text-2xl font-black text-[var(--ink)] mt-1">{value}</div>
      {sub && <div className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">{sub}</div>}
    </div>
  );
}

const STATUS: Record<HistoryItem['status'], { label: string; cls: string; icon: React.ReactNode }> = {
  solved: { label: 'Solved', cls: 'bg-[var(--teal)]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  failed: { label: 'Out of attempts', cls: 'bg-[var(--red)] text-white', icon: <XCircle className="w-3.5 h-3.5" /> },
  forfeited: { label: 'Forfeited', cls: 'bg-[var(--coral)]', icon: <MinusCircle className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In progress', cls: 'bg-[var(--paper-deep)]', icon: <Clock className="w-3.5 h-3.5" /> },
};

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, loading: authLoading, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [values, setValues] = useState<ProfileValues>({ designation: '', branch: '', year: '' });
  const [security, setSecurity] = useState<SecurityValues>({ question: '', answer: '' });
  const [infoMsg, setInfoMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser?.role === 'quizmaster') router.replace('/');
  }, [authLoading, currentUser, router]);

  // Fill the form once, when the user first becomes known
  const userId = currentUser?.id;
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') return;
    setName(currentUser.name);
    setValues({
      designation: currentUser.designation ?? '',
      branch: currentUser.branch ?? '',
      year: currentUser.year ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId || currentUser?.role !== 'user') return;
    (async () => {
      const res = await apiFetch<{ user?: User; stats?: ProfileStats; history?: HistoryItem[] }>('/api/profile');
      if (res.ok) {
        setStats(res.data.stats ?? null);
        setHistory(res.data.history ?? []);
      } else {
        setLoadError(res.data.error ?? 'Could not load your stats.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(null);
    if (name.trim().length < 2) return setInfoMsg({ kind: 'err', text: 'Please enter your full real name.' });
    if (!values.designation || !values.branch || !values.year) return setInfoMsg({ kind: 'err', text: 'Please fill in designation, branch and year.' });
    if ((security.question && !security.answer.trim()) || (!security.question && security.answer.trim())) {
      return setInfoMsg({ kind: 'err', text: 'To change your security question, choose a question and type its answer.' });
    }
    setSavingInfo(true);
    const res = await updateProfile({
      ...values,
      name,
      securityQuestion: security.question || undefined,
      securityAnswer: security.answer || undefined,
    });
    setSavingInfo(false);
    if (res.success) {
      setSecurity({ question: '', answer: '' });
      setInfoMsg({ kind: 'ok', text: 'Your details were saved.' });
    } else {
      setInfoMsg({ kind: 'err', text: res.message });
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!curPass) return setPassMsg({ kind: 'err', text: 'Please enter your current password.' });
    if (newPass.length < 6) return setPassMsg({ kind: 'err', text: 'New password must be at least 6 characters.' });
    setSavingPass(true);
    const res = await apiFetch<{ message?: string }>('/api/profile/password', { method: 'PUT', body: { currentPassword: curPass, newPassword: newPass } });
    setSavingPass(false);
    if (res.ok) {
      setCurPass('');
      setNewPass('');
      setPassMsg({ kind: 'ok', text: 'Password changed.' });
    } else {
      setPassMsg({ kind: 'err', text: res.data.error ?? 'Could not change the password.' });
    }
  };

  const topBar = (
    <div className="flex items-center justify-between gap-3 pb-5 mb-6 border-b-[2.5px] border-[var(--ink)]">
      <Link href="/" className="btn-neo btn-neo-secondary !py-1.5 !px-3.5 text-xs">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Quiz</span>
      </Link>
      <h1 className="text-xl sm:text-2xl font-black text-[var(--ink)]">My Profile</h1>
      <button onClick={toggleTheme} className="btn-neo btn-neo-secondary !p-2 rounded-full" title="Toggle Light / Dark mode">
        {theme === 'dark' ? <Sun className="w-4 h-4 text-[var(--yellow)]" /> : <Moon className="w-4 h-4 text-[var(--ink)]" />}
      </button>
    </div>
  );

  if (authLoading || currentUser?.role === 'quizmaster') {
    return <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-8">{topBar}<div className="text-center text-xs font-bold text-[var(--text-muted)] p-10">Loading…</div></div>;
  }

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-8">
        {topBar}
        <div className="card-neo p-10 text-center bg-[var(--bg-secondary)] space-y-3">
          <p className="text-sm font-bold text-[var(--ink)]">Please sign in to see your profile.</p>
          <Link href="/" className="btn-neo btn-neo-primary text-xs inline-flex">Go to sign in</Link>
        </div>
      </div>
    );
  }

  const solved = history.filter((h) => h.status === 'solved').length;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
      {topBar}

      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl border-[2.5px] border-[var(--ink)] bg-[var(--yellow)] text-[#1b1712] flex items-center justify-center text-3xl font-black shadow-[3px_3px_0_var(--ink)]">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-xl font-black text-[var(--ink)]">{currentUser.name}</div>
          <div className="font-mono text-sm font-bold text-[var(--red)]">{currentUser.uid}</div>
          <div className="text-xs font-semibold text-[var(--text-secondary)]">
            {[currentUser.designation, currentUser.branch, currentUser.year && currentUser.year !== 'N/A' ? `${currentUser.year} year` : null].filter(Boolean).join(' • ')}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loadError && <Notice kind="err" text={loadError} />}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Points" value={<>{stats?.points ?? currentUser.points} ★</>} icon={<Trophy className="w-3.5 h-3.5" />} />
        <Stat label="Rank" value={stats?.rank ? `#${stats.rank}` : '—'} sub={stats ? `of ${stats.totalPlayers} members` : undefined} />
        <Stat
          label="Streak"
          value={<span className="inline-flex items-center gap-1"><Flame className="w-5 h-5 text-[var(--red)] fill-[var(--red)]" />{stats?.streak.current ?? 0}</span>}
          sub={`Best: ${stats?.streak.best ?? 0} ${stats?.streak.best === 1 ? 'day' : 'days'}`}
        />
        <Stat
          label="CW Ratio"
          value={(stats?.cwRatio ?? 0).toFixed(2)}
          sub={`${stats?.correctCount ?? 0}C / ${stats?.wrongCount ?? 0}W`}
          icon={<Target className="w-3.5 h-3.5" />}
        />
      </div>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-[var(--ink)]">
          My Questions <span className="text-xs font-bold text-[var(--text-muted)]">({history.length} played • {solved} solved)</span>
        </h2>
        <div className="card-neo overflow-hidden bg-[var(--bg-secondary)]">
          {history.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">You have not answered any questions yet.</div>
          ) : (
            <div className="divide-y-[2px] divide-[var(--ink)]">
              {history.map((h) => {
                const s = STATUS[h.status];
                return (
                  <div key={h.questionId} className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-[var(--paper-deep)] border-[1.5px] border-[var(--ink)] text-[var(--ink)]">
                          {h.edition !== null ? `ED #${h.edition}` : 'ED —'}
                        </span>
                        <span className="font-extrabold text-sm text-[var(--ink)] truncate">{h.title}</span>
                      </div>
                      <div className="text-[11px] font-mono font-semibold text-[var(--text-secondary)] mt-1">
                        {h.date} • {h.attempts}/{h.maxAttempts} attempts • {h.hintsUsed} {h.hintsUsed === 1 ? 'hint' : 'hints'} used
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full border-[1.5px] border-[var(--ink)] text-[var(--ink)] ${s.cls}`}>
                        {s.icon}{s.label}
                      </span>
                      <span className="font-mono text-sm font-black text-[var(--ink)] w-14 text-right">+{h.points}★</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Edit info */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-[var(--ink)]">Edit My Info</h2>
        <form onSubmit={saveInfo} className="card-neo p-5 bg-[var(--bg-secondary)] space-y-4">
          {infoMsg && <Notice kind={infoMsg.kind} text={infoMsg.text} />}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Real full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya Patil" className={`${inputCls} font-semibold`} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>College UID (cannot be changed)</label>
              <input type="text" value={currentUser.uid} readOnly className={`${inputCls} font-mono font-bold opacity-70 cursor-not-allowed`} />
            </div>
          </div>
          <ProfileFields values={values} onChange={setValues} />
          <div className="pt-3 border-t-[2px] border-[var(--ink)] space-y-3">
            <div className="text-xs font-bold text-[var(--text-secondary)]">
              Current security question: <span className="text-[var(--ink)]">{currentUser.securityQuestion ?? 'not set'}</span>
            </div>
            <SecurityFields values={security} onChange={setSecurity} optional={Boolean(currentUser.securityQuestion)} />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingInfo} className="btn-neo btn-neo-primary text-xs !py-2.5 !px-5">{savingInfo ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-[var(--ink)]">Change Password</h2>
        <form onSubmit={savePassword} className="card-neo p-5 bg-[var(--bg-secondary)] space-y-4">
          {passMsg && <Notice kind={passMsg.kind} text={passMsg.text} />}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelCls}>Current password</label>
              <PasswordInput value={curPass} onChange={setCurPass} placeholder="Your current password" autoComplete="current-password" />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>New password</label>
              <PasswordInput value={newPass} onChange={setNewPass} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPass} className="btn-neo btn-neo-primary text-xs !py-2.5 !px-5">{savingPass ? 'Updating…' : 'Update Password'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
