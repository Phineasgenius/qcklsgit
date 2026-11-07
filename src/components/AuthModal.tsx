'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { User, ShieldCheck, KeyRound, UserCheck, X, Sparkles, GraduationCap } from 'lucide-react';

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
  const { isDark } = useTheme();

  const [tab, setTab] = useState<'user' | 'register' | 'qm'>(initialTab);

  // User login state
  const [userUid, setUserUid] = useState('');
  const [userPass, setUserPass] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regPass, setRegPass] = useState('');

  // QM login state
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
      }, 700);
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
      }, 700);
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
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden relative ${
          isDark 
            ? 'bg-[#161a29] border-[#2b334c] text-white shadow-black/80' 
            : 'bg-white border-[#ebdcc7] text-stone-900 shadow-stone-200'
        }`}
      >
        {/* Header */}
        <div 
          className={`px-6 py-5 border-b flex items-center justify-between ${
            isDark ? 'bg-[#111422] border-[#232a40]' : 'bg-[#faf6ee] border-[#ede3d2]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg tracking-tight">
                {tab === 'qm' ? 'Quizmaster Access' : 'Quiz Club KLS GIT'}
              </h3>
              <p className="text-[11px] opacity-75 font-serif italic">
                {tab === 'qm' ? 'Host Console • Phineas' : 'Member ID Card Authentication'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-all ${
              isDark ? 'border-[#2d344d] hover:bg-[#202538] text-slate-400' : 'border-stone-300 hover:bg-stone-100 text-stone-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div 
          className={`px-6 py-2 border-b grid grid-cols-3 gap-1 text-xs font-semibold ${
            isDark ? 'border-[#22283d] bg-[#121524]' : 'border-stone-200 bg-stone-50'
          }`}
        >
          <button
            onClick={() => { setTab('user'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded-lg transition-all text-center ${
              tab === 'user' ? 'bg-amber-500 text-black font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded-lg transition-all text-center ${
              tab === 'register' ? 'bg-amber-500 text-black font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('qm'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-1.5 rounded-lg transition-all text-center ${
              tab === 'qm' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Quizmaster
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* TAB 1: User Sign In */}
          {tab === 'user' && (
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  College UID (From College ID Card)
                </label>
                <input
                  type="text"
                  required
                  value={userUid}
                  onChange={(e) => setUserUid(e.target.value)}
                  placeholder="e.g. 25u0101"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
                <p className="text-[11px] opacity-60">Format: e.g. 25u0101 on your KLS GIT ID badge.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Sign In to Quiz
              </button>
            </form>
          )}

          {/* TAB 2: Register New Member */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Real Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rohan Kulkarni"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  College UID (On your ID Card)
                </label>
                <input
                  type="text"
                  required
                  value={regUid}
                  onChange={(e) => setRegUid(e.target.value)}
                  placeholder="e.g. 25u0101"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
              >
                Register & Join Leaderboard
              </button>
            </form>
          )}

          {/* TAB 3: Quizmaster Login */}
          {tab === 'qm' && (
            <form onSubmit={handleQMLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                Restricted portal for Quizmaster to upload & manage questions. Default credentials: <strong className="font-mono">phineas & phineastheqm</strong>.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Quizmaster Username
                </label>
                <input
                  type="text"
                  required
                  value={qmUser}
                  onChange={(e) => setQmUser(e.target.value)}
                  placeholder="phineas"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Quizmaster Password
                </label>
                <input
                  type="password"
                  required
                  value={qmPass}
                  onChange={(e) => setQmPass(e.target.value)}
                  placeholder="phineastheqm"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isDark ? 'bg-[#181d2e] border-[#2d3650] text-white' : 'bg-white border-stone-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all shadow-md shadow-purple-900/30 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize as Quizmaster</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
