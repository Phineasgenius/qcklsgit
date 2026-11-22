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
  /** When the member may change their UID next (null = can change now). */
  uidChangeableAt?: string | null;
  /** coins to spend on streak freezes (not the same as points) */
  coins?: number;
  streakFreezes?: number;
  createdAt: string;
}

export type HintTier = 'difficult' | 'medium' | 'easy';

/** What every visitor may see about the active question (never the answers or hint text). */
export interface Question {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  date: string;
  availableHints: HintTier[];
  /** One entry per answer the question asks for (label is empty for a single-answer question). */
  parts: { label: string }[];
  /** Optional picture shown with the question. */
  imageUrl?: string;
}

/** One answer of a question, as seen by the quizmaster. */
export interface QMPart {
  label: string;
  answer: string;
  alternatives: string[];
}

/** Full question as seen by the quizmaster. */
export interface QMQuestion {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  hints: { difficult?: string; medium?: string; easy?: string };
  /** all canonical answers joined with " / " (for search and display) */
  answer: string;
  parts: QMPart[];
  /** shown to members after they finish; never used for checking */
  explanation?: string;
  status: 'draft' | 'active' | 'archived';
  scheduledDate?: string;
  /** file name in the question-images bucket, and its public address */
  imagePath?: string;
  imageUrl?: string;
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
  /** 0-based indexes of the answer parts this member has already solved */
  solvedParts: number[];
  /** set once the user has finished (solved, ran out of attempts, or forfeited) */
  result: QotdResult | null;
  solution: { answers: { label: string; answer: string }[]; explanation?: string } | null;
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
  /** set for the weekly board: Monday and Sunday (YYYY-MM-DD, IST) of the week shown */
  week?: { start: string; end: string };
}

export interface WeeklyWinnersWeek {
  weekStart: string;
  weekEnd: string;
  winners: { rank: number; name: string; uid: string; points: number; correctCount: number; wrongCount: number }[];
}

export interface WinnersResponse {
  weeks: WeeklyWinnersWeek[];
  /** Monday of the week that just ended */
  lastWeekStart: string;
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
  /** points earned in the current Monday-Sunday week */
  weeklyPoints: number;
  weeklyRank: number | null;
  weeklyPlayers: number;
  coins: number;
  streakFreezes: number;
}

export interface CoinLogItem {
  amount: number;
  reason: string;
  createdAt: string;
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
