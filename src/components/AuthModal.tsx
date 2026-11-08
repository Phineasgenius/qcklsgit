'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, ActionResult } from '@/context/AuthContext';
import { ProfileFields, ProfileValues } from './ProfileFields';
import { validateProfileFields } from '@/lib/options';
import Image from 'next/image';
import { ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'user' | 'register' | 'qm';
  onLoginSuccess?: () => void;
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)]';
const monoCls = `${inputCls} font-mono font-bold placeholder:font-sans placeholder:font-normal`;
const labelCls = 'text-xs font-extrabold uppercase text-[var(--text-secondary)]';

export function AuthModal({ isOpen, onClose, initialTab = 'user', onLoginSuccess }: AuthModalProps) {
  const { loginUser, registerUser, loginQM } = useAuth();

  const [tab, setTab] = useState<'user' | 'register' | 'qm'>(initialTab);
  const [userUid, setUserUid] = useState('');
  const [userPass, setUserPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regProfile, setRegProfile] = useState<ProfileValues>({ designation: '', branch: '', year: '' });
  const [qmUser, setQmUser] = useState('');
  const [qmPass, setQmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Re-sync the tab each time the modal is opened from a different button.
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
    if (!regPass) return setErrorMsg('Password is empty. Please create a password.');
    if (regPass.length < 6) return setErrorMsg('Password must be at least 6 characters.');
    const profileErr = validateProfileFields(regProfile.year, regProfile.branch, regProfile.designation);
    if (profileErr) return setErrorMsg(profileErr);
    run(() => registerUser({ name: regName, uid: regUid, password: regPass, ...regProfile }));
  };

  const handleQMLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!qmUser.trim()) return setErrorMsg('Quizmaster Username is empty.');
    if (!qmPass) return setErrorMsg('Quizmaster Password is empty.');
    run(() => loginQM(qmUser, qmPass));
  };

  const switchTab = (t: 'user' | 'register' | 'qm') => {
    setTab(t);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const tabCls = (active: boolean, red = false) =>
    `py-1 text-xs font-bold rounded-full transition-all ${
      active
        ? `${red ? 'bg-[var(--red)] text-white' : 'bg-[var(--yellow)] text-[var(--ink)]'} shadow-[1px_1px_0_var(--ink)] border-[1.5px] border-[var(--ink)]`
        : 'text-[var(--text-secondary)]'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-md max-h-[94vh] overflow-y-auto p-6 bg-[var(--bg-secondary)] space-y-5">
        {/* Header with Official Logo */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-[var(--ink)]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full border-[2px] border-[var(--ink)] bg-white overflow-hidden shadow-[2px_2px_0_var(--ink)] shrink-0">
              <Image src="/logo.png" alt="Quiz Club KLS GIT" width={44} height={44} className="object-cover w-full h-full" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--ink)]">
                {tab === 'qm' ? 'Quizmaster Access' : tab === 'register' ? 'Member Registration' : 'Member Sign In'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Quiz Club KLS GIT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]">
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--paper)]">
          <button onClick={() => switchTab('user')} className={tabCls(tab === 'user')}>Sign In</button>
          <button onClick={() => switchTab('register')} className={tabCls(tab === 'register')}>Sign Up</button>
          <button onClick={() => switchTab('qm')} className={tabCls(tab === 'qm', true)}>Quizmaster</button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--teal)]/20 text-xs font-bold text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
            {successMsg}
          </div>
        )}

        {/* Tab 1: Member Sign In */}
        {tab === 'user' && (
          <form onSubmit={handleUserLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>College UID (as printed on your college ID card)</label>
              <input type="text" value={userUid} onChange={(e) => setUserUid(e.target.value)} placeholder="Enter college UID" autoComplete="username" className={monoCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Password</label>
              <input type="password" value={userPass} onChange={(e) => setUserPass(e.target.value)} placeholder="Enter password" autoComplete="current-password" className={inputCls} />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm">
              {busy ? 'Signing in…' : 'Sign In to Quiz'}
            </button>
          </form>
        )}

        {/* Tab 2: Register New Member */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className={labelCls}>Real Full Name</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Enter your full name" autoComplete="name" className={`${inputCls} font-semibold`} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>College UID (as printed on your college ID card)</label>
              <input type="text" value={regUid} onChange={(e) => setRegUid(e.target.value)} placeholder="Enter college UID" autoComplete="username" className={monoCls} />
            </div>
            <ProfileFields values={regProfile} onChange={setRegProfile} />
            <div className="space-y-1">
              <label className={labelCls}>Create Password (min 6 characters)</label>
              <input type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} placeholder="Create password" autoComplete="new-password" className={inputCls} />
            </div>
            <button type="submit" disabled={busy} className="btn-neo btn-neo-primary w-full !py-3 text-sm">
              {busy ? 'Creating account…' : 'Register & Join'}
            </button>
          </form>
        )}

        {/* Tab 3: Quizmaster Login */}
        {tab === 'qm' && (
          <form onSubmit={handleQMLogin} className="space-y-4">
            <div className="space-y-1">
              <label className={labelCls}>Quizmaster Username</label>
              <input type="text" value={qmUser} onChange={(e) => setQmUser(e.target.value)} placeholder="Enter username" autoComplete="username" className={monoCls} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Quizmaster Password</label>
              <input type="password" value={qmPass} onChange={(e) => setQmPass(e.target.value)} placeholder="Enter password" autoComplete="current-password" className={inputCls} />
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
