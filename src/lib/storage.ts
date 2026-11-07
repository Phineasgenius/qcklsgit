import { User, Question, Submission, HintTier } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const USERS_KEY = 'qcklsgit_users_v1';
const QUESTIONS_KEY = 'qcklsgit_questions_v1';
const ACTIVE_Q_KEY = 'qcklsgit_active_q_id_v1';
const SUBMISSIONS_KEY = 'qcklsgit_submissions_v1';

// Initial seed Quizmaster: phineas & phineastheqm
const DEFAULT_QM: User = {
  id: 'qm-phineas',
  name: 'Phineas (Quizmaster)',
  uid: 'phineas',
  role: 'quizmaster',
  points: 0,
  correctCount: 0,
  wrongCount: 0,
  createdAt: new Date().toISOString(),
};

// Initial student users to populate the leaderboard with realistic KLS GIT UIDs and K/D ratios
const DEFAULT_USERS: User[] = [
  DEFAULT_QM,
  {
    id: 'u-1',
    name: 'Aditya Patil',
    uid: '24u0105',
    role: 'user',
    points: 480,
    correctCount: 5,
    wrongCount: 1, // K/D: 5.00
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'u-2',
    name: 'Sneha Deshpande',
    uid: '25u0101',
    role: 'user',
    points: 420,
    correctCount: 5,
    wrongCount: 2, // K/D: 2.50
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'u-3',
    name: 'Nikhil Kulkarni',
    uid: '23u0219',
    role: 'user',
    points: 360,
    correctCount: 4,
    wrongCount: 1, // K/D: 4.00
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'u-4',
    name: 'Ananya Hegde',
    uid: '25u0412',
    role: 'user',
    points: 290,
    correctCount: 3,
    wrongCount: 2, // K/D: 1.50
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'u-5',
    name: 'Vikram Joshi',
    uid: '24u0340',
    role: 'user',
    points: 210,
    correctCount: 3,
    wrongCount: 4, // K/D: 0.75
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// Initial questions seeded for Quiz Club KLS GIT
const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 'q-1',
    edition: 42,
    title: 'The Belagavi Accord',
    questionText: 'In December 1924, this landmark political assembly convened right here in Belagavi (Belgaum), notable for being the only Congress session ever presided over by a singular iconic figure in modern Indian history. Who was this historical president or what was this session?',
    hints: {
      difficult: 'The temporary venue of this 39th session was famously christened Vijayanagar in tribute to the great southern empire.',
      medium: 'A revered memorial well named "Veera Soudha" with a memorial pylon still stands in Tilakwadi, Belagavi, to commemorate this exact meeting.',
      easy: 'The statesman who presided over this historic session is fondly known throughout the world as the Father of the Nation.',
    },
    answer: 'Mahatma Gandhi (1924 Belgaum Congress Session)',
    funda: 'Belgaum Congress Session / Gandhi only presidency',
    fundaKeywords: ['mahatma', 'gandhi', 'belgaum', 'congress', '1924', 'veera soudha', 'president'],
    status: 'active',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-2',
    edition: 43,
    title: 'The Quantum Feline',
    questionText: 'In 1935, an Austrian-Irish theoretical physicist formulated a renowned paradox to illustrate the bizarre nature of quantum superposition, featuring a sealed steel chamber, a vial of hydrocyanic poison, a Geiger counter, and a domestic animal. What is this famous thought experiment or concept?',
    hints: {
      difficult: 'It was devised in an exchange of letters with Albert Einstein to critique the orthodoxy of the Copenhagen interpretation.',
      medium: 'According to the paradox, the entity enclosed in the chamber remains simultaneously alive and dead until the chamber is unsealed.',
      easy: 'It is named after the physicist whose eponymous wave equation revolutionized quantum mechanics.',
    },
    answer: "Schrödinger's Cat (Quantum Superposition)",
    funda: 'Quantum Superposition / Copenhagen Paradox',
    fundaKeywords: ['schrodinger', 'cat', 'superposition', 'quantum', 'copenhagen'],
    status: 'draft',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q-3',
    edition: 44,
    title: 'The Turing Enigma',
    questionText: 'During World War II, a top-secret British government establishment in Buckinghamshire brought together crossword puzzle champions, chess masters, and mathematicians to decipher the complex electro-mechanical rotor cipher machines used by the Axis powers. What was this legendary estate or codebreaking machine?',
    hints: {
      difficult: 'The operational nerve center was divided into designated wooden buildings known as "Huts", notably Hut 4 and Hut 8.',
      medium: 'Alan Turing designed an electromechanical apparatus nicknamed the "Bombe" to break the daily wheel setups.',
      easy: 'The cryptographic cipher machine being cracked was named Enigma, and the estate was Bletchley Park.',
    },
    answer: 'Bletchley Park / Enigma Machine',
    funda: 'Enigma Codebreaking / Alan Turing Bombe',
    fundaKeywords: ['bletchley', 'park', 'enigma', 'alan turing', 'bombe'],
    status: 'draft',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
];

// Helper to check if in browser
const isClient = typeof window !== 'undefined';

export function getStoredUsers(): User[] {
  if (!isClient) return DEFAULT_USERS;
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(data);
    // Ensure QM always exists
    if (!parsed.some((u: User) => u.uid.toLowerCase() === 'phineas')) {
      parsed.unshift(DEFAULT_QM);
      localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: User[]) {
  if (!isClient) return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving users to localStorage:', err);
  }
}

export function getStoredQuestions(): Question[] {
  if (!isClient) return DEFAULT_QUESTIONS;
  try {
    const data = localStorage.getItem(QUESTIONS_KEY);
    if (!data) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[]) {
  if (!isClient) return;
  try {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed saving questions:', err);
  }
}

export function getActiveQuestionId(): string {
  if (!isClient) return 'q-1';
  try {
    const id = localStorage.getItem(ACTIVE_Q_KEY);
    return id || 'q-1';
  } catch {
    return 'q-1';
  }
}

export function setActiveQuestionId(id: string) {
  if (!isClient) return;
  try {
    localStorage.setItem(ACTIVE_Q_KEY, id);
    // Also mark in questions list
    const questions = getStoredQuestions();
    const updated = questions.map(q => ({
      ...q,
      status: (q.id === id ? 'active' : (q.status === 'active' ? 'archived' : q.status)) as 'active' | 'archived' | 'draft'
    }));
    saveStoredQuestions(updated);
  } catch (err) {
    console.error('Failed setting active question:', err);
  }
}

export function getActiveQuestion(): Question {
  const activeId = getActiveQuestionId();
  const questions = getStoredQuestions();
  const found = questions.find(q => q.id === activeId);
  if (found) return found;
  const firstActive = questions.find(q => q.status === 'active');
  return firstActive || questions[0] || DEFAULT_QUESTIONS[0];
}

export function getStoredSubmissions(): Submission[] {
  if (!isClient) return [];
  try {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function recordSubmission(submission: Submission) {
  if (!isClient) return;
  try {
    const submissions = getStoredSubmissions();
    submissions.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));

    // Update user stats
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === submission.userId);
    if (userIndex !== -1) {
      const user = users[userIndex];
      if (submission.isCorrect) {
        user.points += submission.pointsAwarded;
        user.correctCount += 1;
      } else {
        user.wrongCount += 1;
      }
      users[userIndex] = user;
      saveStoredUsers(users);
    }
  } catch (err) {
    console.error('Failed recording submission:', err);
  }
}

export function deleteUser(userId: string) {
  if (!isClient) return;
  try {
    const users = getStoredUsers().filter(u => u.id !== userId);
    saveStoredUsers(users);

    // Also remove user's submissions
    const submissions = getStoredSubmissions().filter(s => s.userId !== userId);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.error('Failed deleting user:', err);
  }
}

export function getLeaderboard(): (User & { cwRatio: number; rank: number })[] {
  const users = getStoredUsers().filter(u => u.role === 'user');
  
  const sorted = [...users].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.correctCount - a.correctCount;
  });

  return sorted.map((user, idx) => {
    const cwRatio = user.wrongCount === 0 
      ? user.correctCount 
      : Number((user.correctCount / user.wrongCount).toFixed(2));
    return {
      ...user,
      cwRatio,
      rank: idx + 1,
    };
  });
}
