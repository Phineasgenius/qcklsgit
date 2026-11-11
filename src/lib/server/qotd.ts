import { db } from './db';
import { streaksFor } from './board';
import type { HintTier, QotdState, QotdAttempt } from '@/types';

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
  scheduled_date?: string | null;
  created_at: string;
}

interface AttemptRow {
  attempt_no: number;
  guess: string;
  is_correct: boolean;
  is_forfeit: boolean;
  points_awarded: number;
  match_feedback: string | null;
  hints_unlocked: HintTier[] | null;
}

export const TIERS: HintTier[] = ['difficult', 'medium', 'easy'];

export function hintText(q: QuestionRow, tier: HintTier): string | null {
  const v = tier === 'difficult' ? q.hint_difficult : tier === 'medium' ? q.hint_medium : q.hint_easy;
  return v && v.trim() ? v : null;
}

/** One attempt for each clue, plus one. */
export function maxAttemptsFor(q: QuestionRow): number {
  return TIERS.filter((t) => hintText(q, t) !== null).length + 1;
}

/** 100 with no hints; otherwise capped by the easiest clue that was revealed. */
export function pointsFor(tiers: string[]): number {
  if (tiers.includes('easy')) return 50;
  if (tiers.includes('medium')) return 70;
  if (tiers.includes('difficult')) return 90;
  return 100;
}

async function fetchActive(): Promise<QuestionRow | null> {
  const { data } = await db().from('questions').select('*').eq('status', 'active').maybeSingle();
  return (data as QuestionRow | null) ?? null;
}

/**
 * The active question. If it was published on an earlier IST day, the next
 * draft edition is activated first (the database does this atomically), so the
 * first visitor after midnight IST triggers the switch.
 */
export async function getActiveQuestion(): Promise<QuestionRow | null> {
  const q = await fetchActive();
  if (!q || !q.published_at || istDate(q.published_at) >= istDate(null)) return q;

  const { data, error } = await db().rpc('rotate_qotd');
  if (error) {
    // Never break the page because rotation failed; keep serving the current question.
    console.error('[rotate_qotd]', error);
    return q;
  }
  return data ? await fetchActive() : q;
}

function istDate(iso: string | null): string {
  const base = iso ? new Date(iso).getTime() : Date.now();
  return new Date(base + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function buildState(userId: string | null): Promise<QotdState> {
  const q = await getActiveQuestion();
  const empty: QotdState = {
    question: null, maxAttempts: 0, attempts: [], unlockedHints: {}, result: null, solution: null, streak: null,
  };
  if (!q) return empty;

  const max = maxAttemptsFor(q);
  const state: QotdState = {
    ...empty,
    question: {
      id: q.id,
      edition: q.edition,
      title: q.title,
      questionText: q.question_text,
      date: istDate(q.published_at),
      availableHints: TIERS.filter((t) => hintText(q, t) !== null),
    },
    maxAttempts: max,
  };

  if (!userId) return state;

  const [unlocks, subs, streaks] = await Promise.all([
    db().from('hint_unlocks').select('tier').eq('user_id', userId).eq('question_id', q.id),
    db().from('submissions').select('*').eq('user_id', userId).eq('question_id', q.id).order('attempt_no', { ascending: true }),
    streaksFor([userId]),
  ]);

  for (const row of (unlocks.data ?? []) as { tier: HintTier }[]) {
    const text = hintText(q, row.tier);
    if (text) state.unlockedHints[row.tier] = text;
  }
  state.streak = streaks.get(userId) ?? { current: 0, best: 0 };

  const rows = (subs.data ?? []) as AttemptRow[];
  state.attempts = rows.map<QotdAttempt>((r) => ({
    guess: r.guess,
    isCorrect: r.is_correct,
    forfeited: r.is_forfeit,
    feedback: r.match_feedback ?? '',
  }));

  const solved = rows.find((r) => r.is_correct);
  const forfeit = rows.find((r) => r.is_forfeit);
  const exhausted = rows.length >= max;

  if (solved || forfeit || exhausted) {
    const last = rows[rows.length - 1];
    state.result = {
      status: solved ? 'solved' : forfeit ? 'forfeited' : 'failed',
      pointsAwarded: solved ? solved.points_awarded : 0,
      feedback: last?.match_feedback ?? '',
      hintsUnlocked: (solved?.hints_unlocked ?? (Object.keys(state.unlockedHints) as HintTier[])),
    };
    state.solution = { answer: q.answer, funda: q.funda ?? undefined };
  }

  return state;
}