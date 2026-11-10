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
  securityQuestion?: string | null;
  /** true when a student still has to give year / branch / designation / security question */
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

export interface StreakInfo {
  current: number;
  best: number;
}

export interface QotdAttempt {
  guess: string;
  isCorrect: boolean;
  forfeited: boolean;
  feedback: string;
}

export interface QotdResult {
  status: 'solved' | 'failed' | 'forfeited';
  pointsAwarded: number;
  feedback: string;
  hintsUnlocked: HintTier[];
}

/** The per-user state of today's question. Everything here is stored in the database. */
export interface QotdState {
  question: Question | null;
  /** hints + 1 */
  maxAttempts: number;
  attempts: QotdAttempt[];
  unlockedHints: Partial<Record<HintTier, string>>;
  /** set once the user has finished (solved, ran out of attempts, or forfeited) */
  result: QotdResult | null;
  solution: { answer: string; funda?: string } | null;
  streak: StreakInfo | null;
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
  streak: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  /** the signed-in member, only when they are NOT in the top 10 */
  me: LeaderboardEntry | null;
  meId: string | null;
  total: number;
  /** set when the response is a search result instead of the top 10 */
  query?: string;
}

export interface ProfileStats {
  points: number;
  correctCount: number;
  wrongCount: number;
  cwRatio: number;
  rank: number | null;
  totalPlayers: number;
  streak: StreakInfo;
  questionsPlayed: number;
}

export interface HistoryItem {
  questionId: string;
  edition: number | null;
  title: string;
  date: string;
  status: 'solved' | 'failed' | 'forfeited' | 'in_progress';
  attempts: number;
  maxAttempts: number;
  points: number;
  hintsUsed: number;
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
  forfeited: boolean;
  overridden: boolean;
  attemptNo: number;
  hintsUsed: HintTier[];
  pointsAwarded: number;
  timestamp: string;
}
