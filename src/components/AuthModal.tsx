'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, ActionResult } from '@/context/AuthContext';
import { ProfileFields, ProfileValues } from './ProfileFields';
import { SecurityFields, SecurityValues } from './SecurityFields';
import { PasswordInput } from './PasswordInput';
import { validateProfileFields, validateSecurity } from '@/lib/options';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import { ShieldCheck, X, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'user' | 'register' | 'qm';
  onLoginSuccess?: () => void;
}

type Tab = 'user' | 'register' | 'qm' | 'forgot';

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal';
const monoCls = `${inputCls} font-mono font-bold`;
const labelCls = 'text-xs font-extrabold uppercase text-[var(--text-secondary)]';

export function AuthModal({ isOpen, onClose, initialTab = 'user', onLoginSuccess }: AuthModalProps) {
  const { loginUser, registerUser, loginQM } = useAuth();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [userUid, setUserUid] = useState('');
  const [userPass, setUserPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regProfile, setRegProfile] = useState<ProfileValues>({ designation: '', branch: '', year: '' });
  const [regSecurity, setRegSecurity] = useState<SecurityValues>({ question: '', answer: '' });
  const [qmUser, setQmUser] = useState('');
  const [qmPass, setQmPass] = useState('');

  // Forgot-password flow
  const [fUid, setFUid] = useState('');
  const [fQuestion, setFQuestion] = useState('');
  const [fAnswer, setFAnswer] = useState('');
  const [fPass, setFPass] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const finish = (res: ActionResult) => {
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const run = async (action: () => Promise<ActionResult>) => {
    if (busy) return;
    setBusy(true);
    setErrorMsg('');
    finish(await action());
    setBusy(false);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!userUid.trim()) return setErrorMsg('College UID is empty. Please enter your college UID.');
    if (!userPass) return setErrorMsg('Password is empty. Please enter your password.');
    run(() => loginUser(userUid, userPass));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim()) return setErrorMsg('Real Name is empty. Please enter your full real name.');
    if (!regUid.trim()) return setErrorMsg('College UID is empty. Please enter your college UID.');
    const profileErr = validateProfileFields(regProfile.year, regProfile.branch, regProfile.designation);
    if (profileErr) return setErrorMsg(profileErr);
    const secErr = validateSecurity(regSecurity.question, regSecurity.answer);
    if (secErr) return setErrorMsg(secErr);
    if (!regPass) return setErrorMsg('Password is empty. Please create a password.');
    if (regPass.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    run(() =>
      registerUser({
        name: regName,
        uid: regUid,
        password: regPass,
        ...regProfile,
        securityQuestion: regSecurity.question,
        securityAnswer: regSecurity.answer,
      })
    );
  };

  const handleQMLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!qmUser.trim()) return setErrorMsg('Quizmaster Username is empty.');
    if (!qmPass) return setErrorMsg('Quizmaster Password is empty.');
    run(() => loginQM(qmUser, qmPass));
  };

  // Forgot password, step 1: look up the security question
  const handleForgotLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErrorMsg('');
    if (!fUid.trim()) return setErrorMsg('Please enter your college UID.');
    setBusy(true);
    const res = await apiFetch<{ question?: string }>('/api/auth/forgot/question', { method: 'POST', body: { uid: fUid } });
    setBusy(false);
    if (res.ok && res.data.question) setFQuestion(res.data.question);
    else setErrorMsg(res.data.error ?? 'Could not find your security question.');
  };

  // Forgot password, step 2: answer + new password
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setErrorMsg('');
    if (!fAnswer.trim()) return setErrorMsg('Please enter your answer.');
    if (fPass.length < 6) return setErrorMsg('New password must be at least 6 characters.');
    setBusy(true);
    const res = await apiFetch<{ message?: string }>('/api/auth/forgot/reset', {
      method: 'POST',
      body: { uid: fUid, answer: fAnswer, newPassword: fPass },
    });
    setBusy(false);
    if (!res.ok) return setErrorMsg(res.data.error ?? 'Could not reset the password.');
    setUserUid(fUid.trim().toLowerCase());
    setUserPass('');
    setFQuestion('');
    setFAnswer('');
    setFPass('');
    setTab('user');
    setSuccessMsg(res.data.message ?? 'Password updated. Please sign in.');
  };

  const tabCls = (active: boolean, red = false) =>
    `py-1 text-xs font-bold rounded-full transition-all ${
      active
        ? `${red ? 'bg-[var(--red)] text-white' : 'bg-[var(--yellow)] text-[var(--ink)]'} shadow-[1px_1px_0_var(--ink)] border-[1.5px] border-[var(--ink)]`
        : 'text-[var(--text-secondary)]'
    }`;

  const title =
    tab === 'qm' ? 'Quizmaster Access' : tab === 'register' ? 'Member Registration' : tab === 'forgot' ? 'Reset Password' : 'Member Sign In';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-md max-h-[94vh] overflow-y-auto p-6 bg-[var(--bg-secondary)] space-y-5">
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-[var(--ink)]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full border-[2px] border-[var(--ink)] bg-white overflow-hidden shadow-[2px_2px_0_var(--ink)] shrink-0">
              <Image src="/logo.png" alt="Quiz Club KLS GIT" width={44} height={44} className="object-cover w-full h-full" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--ink)]">{title}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Quiz Club KLS GIT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]">
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--paper)]">
          <button onClick={() => switchTab('user')} className={tabCls(tab === 'user' || tab === 'forgot')}>Sign In</button>
          <button onClick={() => switchTab('register')} className={tabCls(tab === 'register')}>Sign Up</button>
          <button onClick={() => switchTab('qm')} className={tabCls(tab === 'qm', true)}>Quizmaster</button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--teal)]/20 text-xs font-bold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">{successMsg}</div>
        )}

        {/* Sign in */}
        {tab === 'user' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>College UID (as printed on your ID card)</label>
              <input type="text" value={userUid} onChange={(e) => setUserUid(e.target.value)} placeholder="e.g. 25u0101" autoComplete="username" className={monoCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Password</label>
              <PasswordInput value={userPass} onChange={setUserPass} placeholder="Your password" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm">
              {busy ? 'Signing in…' : 'Sign In to Quiz'}
            </button>
            <button
              type="button"
              onClick={() => { setFUid(userUid); setFQuestion(''); switchTab('forgot'); }}
              className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:underline"
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* Forgot password */}
        {tab === 'forgot' && !fQuestion && (
          <form onSubmit={handleForgotLookup} className="space-y-4">
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Enter your college UID. We will ask the security question you chose at sign-up.
            </p>
            <div className="space-y-1">
              <label className={labelCls}>College UID</label>
              <input type="text" value={fUid} onChange={(e) => setFUid(e.target.value)} placeholder="e.g. 25u0101" className={monoCls} />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm flex items-center justify-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>{busy ? 'Looking up…' : 'Continue'}</span>
            </button>
            <button type="button" onClick={() => switchTab('user')} className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:underline">
              Back to sign in
            </button>
          </form>
        )}

        {tab === 'forgot' && fQuestion && (
          <form onSubmit={handleForgotReset} className="space-y-4">
            <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper-deep)] text-xs font-bold text-[var(--ink)]">
              {fQuestion}
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Your answer</label>
              <input type="text" value={fAnswer} onChange={(e) => setFAnswer(e.target.value)} placeholder="Type your answer" autoComplete="off" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>New password (min 6 characters)</label>
              <PasswordInput value={fPass} onChange={setFPass} placeholder="Create a new password" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm">
              {busy ? 'Resetting…' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setFQuestion(''); setErrorMsg(''); }} className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:underline">
              Use a different UID
            </button>
          </form>
        )}

        {/* Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className={labelCls}>Real Full Name</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Ananya Patil" autoComplete="name" className={`${inputCls} font-semibold`} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>College UID (as printed on your ID card)</label>
              <input type="text" value={regUid} onChange={(e) => setRegUid(e.target.value)} placeholder="e.g. 25u0101" autoComplete="username" className={monoCls} />
            </div>
            <ProfileFields values={regProfile} onChange={setRegProfile} />
            <SecurityFields values={regSecurity} onChange={setRegSecurity} />
            <div className="space-y-1">
              <label className={labelCls}>Create Password (min 6 characters)</label>
              <PasswordInput value={regPass} onChange={setRegPass} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm">
              {busy ? 'Creating account…' : 'Register & Join'}
            </button>
          </form>
        )}

        {/* Quizmaster */}
        {tab === 'qm' && (
          <form onSubmit={handleQMLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Quizmaster Username</label>
              <input type="text" value={qmUser} onChange={(e) => setQmUser(e.target.value)} placeholder="Quizmaster username" autoComplete="username" className={monoCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Quizmaster Password</label>
              <PasswordInput value={qmPass} onChange={setQmPass} placeholder="Quizmaster password" autoComplete="current-password" />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{busy ? 'Checking…' : 'Authorize as Quizmaster'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
