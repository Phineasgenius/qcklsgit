import { db } from './db';
import type { HintTier, QotdState } from '@/types';

export interface QuestionRow {
  id: string;
  edition: number;
  title: string;
  question_text: string;
  hint_difficult: string | null;
  hint_medium: string | null;
  hint_easy: string | null;
  answer: string;
  funda: string | null;
  funda_keywords: string[] | null;
  status: 'draft' | 'active' | 'archived';
  published_at: string | null;
  created_at: string;
}

export const TIERS: HintTier[] = ['difficult', 'medium', 'easy'];

export function hintText(q: QuestionRow, tier: HintTier): string | null {
  const v = tier === 'difficult' ? q.hint_difficult : tier === 'medium' ? q.hint_medium : q.hint_easy;
  return v && v.trim() ? v : null;
}

/** 100 with no hints; otherwise capped by the easiest clue that was revealed. */
export function pointsFor(tiers: string[]): number {
  if (tiers.includes('easy')) return 50;
  if (tiers.includes('medium')) return 70;
  if (tiers.includes('difficult')) return 90;
  return 100;
}

export async function getActiveQuestion(): Promise<QuestionRow | null> {
  const { data } = await db().from('questions').select('*').eq('status', 'active').maybeSingle();
  return (data as QuestionRow | null) ?? null;
}

function istDate(iso: string | null): string {
  const base = iso ? new Date(iso).getTime() : Date.now();
  return new Date(base + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function buildState(userId: string | null): Promise<QotdState> {
  const q = await getActiveQuestion();
  if (!q) return { question: null, unlockedHints: {}, submission: null, solution: null };

  const state: QotdState = {
    question: {
      id: q.id,
      edition: q.edition,
      title: q.title,
      questionText: q.question_text,
      date: istDate(q.published_at),
      availableHints: TIERS.filter((t) => hintText(q, t) !== null),
    },
    unlockedHints: {},
    submission: null,
    solution: null,
  };

  if (!userId) return state;

  const [unlocks, sub] = await Promise.all([
    db().from('hint_unlocks').select('tier').eq('user_id', userId).eq('question_id', q.id),
    db().from('submissions').select('*').eq('user_id', userId).eq('question_id', q.id).maybeSingle(),
  ]);

  for (const row of (unlocks.data ?? []) as { tier: HintTier }[]) {
    const text = hintText(q, row.tier);
    if (text) state.unlockedHints[row.tier] = text;
  }

  if (sub.data) {
    const s = sub.data as {
      is_correct: boolean;
      points_awarded: number;
      guess: string;
      match_feedback: string | null;
      hints_unlocked: HintTier[] | null;
    };
    state.submission = {
      isCorrect: s.is_correct,
      pointsAwarded: s.points_awarded,
      guess: s.guess,
      feedback: s.match_feedback ?? '',
      forfeited: s.guess === '[Forfeited]',
      hintsUnlocked: s.hints_unlocked ?? [],
    };
    state.solution = { answer: q.answer, funda: q.funda ?? undefined };
  }

  return state;
}
