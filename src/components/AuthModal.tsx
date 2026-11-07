'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, ShieldCheck, KeyRound, X, Sparkles, GraduationCap } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'user' | 'register' | 'qm';
  onLoginSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'user',
  onLoginSuccess,
}: AuthModalProps) {
  const { loginUser, registerUser, loginQM } = useAuth();

  const [tab, setTab] = useState<'user' | 'register' | 'qm'>(initialTab);
  const [userUid, setUserUid] = useState('');
  const [userPass, setUserPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regPass, setRegPass] = useState('');
  const [qmUser, setQmUser] = useState('');
  const [qmPass, setQmPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginUser(userUid, userPass);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = registerUser(regName, regUid, regPass);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQMLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = loginQM(qmUser, qmPass);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-[var(--ink)]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
              <GraduationCap className="w-5 h-5 text-[var(--ink)]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--ink)]">
                {tab === 'qm' ? 'Quizmaster Access' : 'Quiz Club KLS GIT'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                {tab === 'qm' ? 'Credentials: phineas / phineastheqm' : 'College ID Card Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-[1.5px] border-[var(--ink)] hover:bg-[var(--paper-deep)]"
          >
            <X className="w-4 h-4 text-[var(--ink)]" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full border-[2px] border-[var(--ink)] bg-[var(--paper)]">
          <button
            onClick={() => { setTab('user'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1 text-xs font-bold rounded-full transition-all ${
              tab === 'user' ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-[1px_1px_0_var(--ink)] border-[1.5px] border-[var(--ink)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1 text-xs font-bold rounded-full transition-all ${
              tab === 'register' ? 'bg-[var(--yellow)] text-[var(--ink)] shadow-[1px_1px_0_var(--ink)] border-[1.5px] border-[var(--ink)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('qm'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1 text-xs font-bold rounded-full transition-all ${
              tab === 'qm' ? 'bg-[var(--red)] text-white shadow-[1px_1px_0_var(--ink)] border-[1.5px] border-[var(--ink)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            Quizmaster
          </button>
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
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                College UID (From ID Card)
              </label>
              <input
                type="text"
                required
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                placeholder="e.g. 25u0101"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-mono text-sm font-bold shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Password
              </label>
              <input
                type="password"
                required
                value={userPass}
                onChange={(e) => setUserPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-neo btn-neo-primary w-full !py-3 text-sm"
            >
              Sign In to Quiz
            </button>
          </form>
        )}

        {/* Tab 2: Register New Member */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Real Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Rohan Kulkarni"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm font-semibold shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                College UID (On ID Card)
              </label>
              <input
                type="text"
                required
                value={regUid}
                onChange={(e) => setRegUid(e.target.value)}
                placeholder="e.g. 25u0101"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-mono text-sm font-bold shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Create Password
              </label>
              <input
                type="password"
                required
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-neo btn-neo-primary w-full !py-3 text-sm"
            >
              Register & Join Leaderboard
            </button>
          </form>
        )}

        {/* Tab 3: Quizmaster Login */}
        {tab === 'qm' && (
          <form onSubmit={handleQMLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Quizmaster Username
              </label>
              <input
                type="text"
                required
                value={qmUser}
                onChange={(e) => setQmUser(e.target.value)}
                placeholder="phineas"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] font-mono text-sm font-bold shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-extrabold uppercase text-[var(--text-secondary)]">
                Quizmaster Password
              </label>
              <input
                type="password"
                required
                value={qmPass}
                onChange={(e) => setQmPass(e.target.value)}
                placeholder="phineastheqm"
                className="w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-neo btn-neo-primary w-full !py-3 text-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize as Quizmaster</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
