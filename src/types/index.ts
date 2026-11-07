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
  maxPointsIfUsed: number;
}

export interface Question {
  id: string;
  edition: number;
  title: string;
  questionText: string;
  hints: {
    difficult?: string;
    medium?: string;
    easy?: string;
  };
  answer: string;
  funda?: string; // Expected funda / concept which is also accepted if given
  fundaKeywords?: string[];
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
  matchScore: number;
  matchFeedback?: string;
  timestamp: string;
}
