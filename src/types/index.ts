export type UserRole = 'user' | 'quizmaster';

export interface User {
  id: string;
  name: string;
  uid: string; // College assigned UID (e.g. 25u0101)
  role: UserRole;
  points: number;
  correctCount: number;
  wrongCount: number;
  avatarSeed?: string;
  createdAt: string;
}

export type HintTier = 'difficult' | 'medium' | 'easy';

export interface HintConfig {
  tier: HintTier;
  label: string;
  text: string;
  maxPointsIfUsed: number; // 90 for difficult, 70 for medium, 50 for easy
}

export interface Question {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  hints: {
    difficult?: string; // 1st hint (Toughest) -> gives 90 pts
    medium?: string;    // 2nd hint (Medium) -> gives 70 pts
    easy?: string;      // 3rd hint (Easiest) -> gives 50 pts
  };
  answer: string;
  fundaKeywords?: string[]; // Keywords for "give funda" checking
  isFunda: boolean;
  status: 'draft' | 'active' | 'archived';
  date: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userUid: string;
  questionId: string;
  guess: string;
  hintsUnlocked: HintTier[];
  pointsAwarded: number;
  isCorrect: boolean;
  matchScore: number; // 0 to 1 confidence
  matchFeedback?: string;
  timestamp: string;
}

export type ThemeMode = 'morning' | 'golden' | 'dusk' | 'midnight';
export type MotionSpeed = 'calm' | 'breeze' | 'gale';
export type CompanionType = 'cat' | 'dog' | 'owl' | 'none';
