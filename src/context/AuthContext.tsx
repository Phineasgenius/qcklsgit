'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/types';
import { apiFetch } from '@/lib/api';
import { DAILY_COINS } from '@/lib/shop';

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface ProfileInput {
  year: string;
  branch: string;
  designation: string;
  name?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface RegisterInput {
  name: string;
  uid: string;
  password: string;
  year: string;
  branch: string;
  designation: string;
  securityQuestion: string;
  securityAnswer: string;
}

interface AuthContextType {
  currentUser: User | null;
  isQM: boolean;
  loading: boolean;
  loginUser: (uid: string, pass: string) => Promise<ActionResult>;
  registerUser: (input: RegisterInput) => Promise<ActionResult>;
  loginQM: (username: string, pass: string) => Promise<ActionResult>;
  updateProfile: (input: ProfileInput) => Promise<ActionResult>;
  changeUid: (uid: string, password: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCurrentUser: (u: User | null) => void;
  /** e.g. "+5 coins for showing up today"; shown briefly after opening the site */
  dailyNote: string | null;
  clearDailyNote: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserResponse = { user?: User | null; message?: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyNote, setDailyNote] = useState<string | null>(null);
  const dailyFor = useRef<string | null>(null);
  const clearDailyNote = useCallback(() => setDailyNote(null), []);

  const refreshUser = useCallback(async () => {
    const res = await apiFetch<UserResponse>('/api/auth/me');
    if (res.ok) setCurrentUser(res.data.user ?? null);
  }, []);

  // The session lives in an httpOnly cookie; ask the server who we are.
  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  // Once per page load for a signed-in member: streak freezes cover missed days, and the daily coins are paid.
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'user') return;
    if (dailyFor.current === currentUser.id) return;
    dailyFor.current = currentUser.id;
    (async () => {
      const res = await apiFetch<UserResponse & { claimed?: boolean; freezesUsed?: number }>('/api/daily', { method: 'POST' });
      if (!res.ok) return;
      if (res.data.user) setCurrentUser(res.data.user);
      const notes: string[] = [];
      if (res.data.freezesUsed) {
        notes.push(`A streak freeze covered ${res.data.freezesUsed === 1 ? 'a missed day' : `${res.data.freezesUsed} missed days`} and saved your streak`);
      }
      if (res.data.claimed) notes.push(`+${DAILY_COINS} coins for showing up today`);
      if (notes.length > 0) {
        setDailyNote(notes.join(' • '));
        setTimeout(() => setDailyNote(null), 9000);
      }
    })();
  }, [currentUser]);

  const authCall = async (url: string, body: unknown): Promise<ActionResult> => {
    const res = await apiFetch<UserResponse>(url, { method: 'POST', body });
    if (res.ok && res.data.user) {
      setCurrentUser(res.data.user);
      return { success: true, message: res.data.message ?? 'Signed in.' };
    }
    return { success: false, message: res.data.error ?? 'Something went wrong.' };
  };

  const loginUser = (uid: string, password: string) => authCall('/api/auth/login', { uid, password });
  const registerUser = (input: RegisterInput) => authCall('/api/auth/register', input);
  const loginQM = (username: string, password: string) => authCall('/api/auth/qm', { username, password });

  const updateProfile = async (input: ProfileInput): Promise<ActionResult> => {
    const res = await apiFetch<UserResponse>('/api/profile', { method: 'PUT', body: input });
    if (res.ok && res.data.user) {
      setCurrentUser(res.data.user);
      return { success: true, message: 'Profile saved.' };
    }
    return { success: false, message: res.data.error ?? 'Could not save your details.' };
  };

  const changeUid = async (uid: string, password: string): Promise<ActionResult> => {
    const res = await apiFetch<UserResponse>('/api/profile/uid', { method: 'PUT', body: { uid, password } });
    if (res.ok && res.data.user) {
      setCurrentUser(res.data.user);
      return { success: true, message: res.data.message ?? 'UID changed.' };
    }
    return { success: false, message: res.data.error ?? 'Could not change your UID.' };
  };

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  const deleteMyAccount = async () => {
    const res = await apiFetch('/api/account', { method: 'DELETE' });
    if (res.ok) setCurrentUser(null);
  };

  const isQM = currentUser?.role === 'quizmaster';

  return (
    <AuthContext.Provider
      value={{ currentUser, isQM, loading, loginUser, registerUser, loginQM, updateProfile, changeUid, logout, deleteMyAccount, refreshUser, setCurrentUser, dailyNote, clearDailyNote }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
