'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiFetch } from '@/lib/api';

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
  logout: () => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setCurrentUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserResponse = { user?: User | null; message?: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      value={{ currentUser, isQM, loading, loginUser, registerUser, loginQM, updateProfile, logout, deleteMyAccount, refreshUser, setCurrentUser }}
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
