'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getStoredUsers, saveStoredUsers } from '@/lib/storage';

interface AuthContextType {
  currentUser: User | null;
  isQM: boolean;
  loginUser: (uid: string, pass: string) => { success: boolean; message: string };
  registerUser: (name: string, uid: string, pass: string) => { success: boolean; message: string };
  loginQM: (username: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  refreshUser: () => void;
}

const CURRENT_USER_KEY = 'qcklsgit_active_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        // Refresh with latest from stored users
        const users = getStoredUsers();
        const found = users.find(u => u.id === user.id);
        setCurrentUser(found || user);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshUser = () => {
    if (!currentUser) return;
    const users = getStoredUsers();
    const found = users.find(u => u.id === currentUser.id);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    }
  };

  const loginUser = (uidInput: string, passInput: string): { success: boolean; message: string } => {
    const cleanUid = uidInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    if (!cleanUid || !cleanPass) {
      return { success: false, message: 'Please provide both college UID and password.' };
    }

    // Check if QM credentials provided in user login tab
    if (cleanUid === 'phineas' && cleanPass === 'phineastheqm') {
      return loginQM('phineas', 'phineastheqm');
    }

    const users = getStoredUsers();
    const found = users.find(u => u.uid.toLowerCase() === cleanUid);

    if (!found) {
      return { 
        success: false, 
        message: 'UID not registered yet. Switch to "Sign Up" to register with your real name & ID card UID.' 
      };
    }

    // Simple check for demo / persistent state
    setCurrentUser(found);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true, message: `Welcome back, ${found.name}!` };
  };

  const registerUser = (nameInput: string, uidInput: string, passInput: string): { success: boolean; message: string } => {
    const cleanName = nameInput.trim();
    const cleanUid = uidInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    if (!cleanName || !cleanUid || !cleanPass) {
      return { success: false, message: 'Please fill in real name, college UID, and password.' };
    }

    if (cleanUid.length < 4) {
      return { success: false, message: 'Please enter a valid college UID (e.g. 25u0101 as on your ID card).' };
    }

    if (cleanUid === 'phineas') {
      return { success: false, message: 'UID "phineas" is reserved for the Quizmaster.' };
    }

    const users = getStoredUsers();
    if (users.some(u => u.uid.toLowerCase() === cleanUid)) {
      return { success: false, message: 'This college UID is already registered. Please sign in.' };
    }

    const newUser: User = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      uid: cleanUid,
      role: 'user',
      points: 0,
      correctCount: 0,
      wrongCount: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);
    setCurrentUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, message: `Registration successful! Welcome to Quiz Club KLS GIT, ${cleanName}!` };
  };

  const loginQM = (username: string, pass: string): { success: boolean; message: string } => {
    const cleanU = username.trim().toLowerCase();
    const cleanP = pass.trim();

    // Required by user: username and password phineas & phineastheqm
    if (cleanU === 'phineas' && cleanP === 'phineastheqm') {
      const qmUser: User = {
        id: 'qm-phineas',
        name: 'Phineas (Quizmaster)',
        uid: 'phineas',
        role: 'quizmaster',
        points: 0,
        correctCount: 0,
        wrongCount: 0,
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(qmUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(qmUser));
      return { success: true, message: 'Quizmaster authorized. Welcome, Phineas!' };
    }

    return { success: false, message: 'Invalid Quizmaster credentials. Expected phineas / phineastheqm.' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const isQM = currentUser?.role === 'quizmaster';

  return (
    <AuthContext.Provider value={{ currentUser, isQM, loginUser, registerUser, loginQM, logout, refreshUser }}>
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
