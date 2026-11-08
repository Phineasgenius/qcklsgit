export type UserRole = 'user' | 'quizmaster';

export interface User {
  id: string;
  name: string;
  uid: string; // College assigned UID (e.g. 25u0101)
  role: UserRole;
  points: number;
  correctCount: number;
  wrongCount: number;
  year?: string | null;
  branch?: string | null;
  designation?: string | null;
  /** true when a student still has to give year / branch / designation */
  needsProfile?: boolean;
  createdAt: string;
}

export type HintTier = 'difficult' | 'medium' | 'easy';

/** What every visitor may see about the active question (never the answer or hint text). */
export interface Question {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  date: string;
  availableHints: HintTier[];
}

/** Full question as seen by the quizmaster. */
export interface QMQuestion {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  hints: { difficult?: string; medium?: string; easy?: string };
  answer: string;
  funda?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
}

export interface QotdSubmission {
  isCorrect: boolean;
  pointsAwarded: number;
  guess: string;
  feedback: string;
  forfeited: boolean;
  hintsUnlocked: HintTier[];
}

/** The per-user state of today's question. Everything here is stored in the database. */
export interface QotdState {
  question: Question | null;
  unlockedHints: Partial<Record<HintTier, string>>;
  submission: QotdSubmission | null;
  /** only present once the user has finished (answered or forfeited) */
  solution: { answer: string; funda?: string } | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  uid: string;
  points: number;
  correctCount: number;
  wrongCount: number;
  cwRatio: number;
  rank: number;
}

/** Row shown in the quizmaster "Manage Users" tab. */
export interface QMUser {
  id: string;
  name: string;
  uid: string;
  points: number;
  correctCount: number;
  wrongCount: number;
  year: string | null;
  branch: string | null;
  designation: string | null;
  createdAt: string;
}

/** Row shown in the quizmaster "Submissions" tab. */
export interface Submission {
  id: string;
  userName: string;
  userUid: string;
  edition: number | null;
  guess: string;
  isCorrect: boolean;
  pointsAwarded: number;
  timestamp: string;
}
