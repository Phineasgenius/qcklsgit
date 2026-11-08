import bcrypt from 'bcryptjs';
import { db } from '@/lib/server/db';
import { fail, handle, json, readBody, requireUser, str, toUser, ProfileRow } from '@/lib/server/helpers';
import { loadRanked, streaksFor } from '@/lib/server/board';
import { TIERS } from '@/lib/server/qotd';
import { istDay } from '@/lib/server/streak';
import { normalizeSecurityAnswer, validateProfileFields, validateSecurity } from '@/lib/options';
import type { HistoryItem, ProfileStats } from '@/types';

export const dynamic = 'force-dynamic';

interface HistRow {
  question_id: string;
  is_correct: boolean;
  is_forfeit: boolean;
  points_awarded: number;
  hints_unlocked: string[] | null;
  created_at: string;
  questions:
    | { edition: number; title: string; hint_difficult: string | null; hint_medium: string | null; hint_easy: string | null }
    | { edition: number; title: string; hint_difficult: string | null; hint_medium: string | null; hint_easy: string | null }[]
    | null;
}

export const GET = handle(async () => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const [ranked, streaks, hist] = await Promise.all([
    loadRanked('points'),
    streaksFor([me.id]),
    db()
      .from('submissions')
      .select('question_id, is_correct, is_forfeit, points_awarded, hints_unlocked, created_at, questions(edition, title, hint_difficult, hint_medium, hint_easy)')
      .eq('user_id', me.id)
      .order('created_at', { ascending: true }),
  ]);
  if (hist.error) throw hist.error;

  const groups = new Map<string, HistRow[]>();
  for (const r of (hist.data ?? []) as unknown as HistRow[]) {
    const list = groups.get(r.question_id) ?? [];
    list.push(r);
    groups.set(r.question_id, list);
  }

  const history: HistoryItem[] = [];
  for (const [questionId, rows] of groups) {
    const first = rows[0];
    const q = Array.isArray(first.questions) ? first.questions[0] : first.questions;
    const hintCount = q ? [q.hint_difficult, q.hint_medium, q.hint_easy].filter((h) => h && h.trim()).length : TIERS.length;
    const max = hintCount + 1;
    const solved = rows.find((r) => r.is_correct);
    const forfeited = rows.some((r) => r.is_forfeit);
    const last = rows[rows.length - 1];
    history.push({
      questionId,
      edition: q?.edition ?? null,
      title: q?.title ?? 'Deleted question',
      date: istDay(last.created_at),
      status: solved ? 'solved' : forfeited ? 'forfeited' : rows.length >= max ? 'failed' : 'in_progress',
      attempts: rows.length,
      maxAttempts: max,
      points: solved ? solved.points_awarded : 0,
      hintsUsed: Math.max(0, ...rows.map((r) => (r.hints_unlocked ?? []).length)),
    });
  }
  history.sort((a, b) => b.date.localeCompare(a.date) || (b.edition ?? 0) - (a.edition ?? 0));

  const mine = ranked.find((r) => r.id === me.id);
  const stats: ProfileStats = {
    points: me.points,
    correctCount: me.correct_count,
    wrongCount: me.wrong_count,
    cwRatio: me.wrong_count === 0 ? me.correct_count : Number((me.correct_count / me.wrong_count).toFixed(2)),
    rank: mine?.rank ?? null,
    totalPlayers: ranked.length,
    streak: streaks.get(me.id) ?? { current: 0, best: 0 },
    questionsPlayed: history.length,
  };

  return json({ user: toUser(me), stats, history });
});

export const PUT = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in first.', 401);

  const b = await readBody(req);
  const update: Record<string, unknown> = {};

  if (b.name !== undefined) {
    const name = str(b.name, 80);
    if (name.length < 2) return fail('Please enter your full real name.');
    update.name = name;
  }

  const year = str(b.year, 10);
  const branch = str(b.branch, 30);
  const designation = str(b.designation, 30);
  const err = validateProfileFields(year, branch, designation);
  if (err) return fail(err);
  Object.assign(update, { year, branch, designation });

  const securityQuestion = str(b.securityQuestion, 200);
  const securityAnswer = str(b.securityAnswer, 100);
  if (securityQuestion || securityAnswer) {
    const secErr = validateSecurity(securityQuestion, securityAnswer);
    if (secErr) return fail(secErr);
    update.security_question = securityQuestion;
    update.security_answer_hash = await bcrypt.hash(normalizeSecurityAnswer(securityAnswer), 10);
    update.reset_fails = 0;
    update.reset_locked_until = null;
  } else if (!me.security_question) {
    return fail('Please choose a security question and answer. You will need it if you forget your password.');
  }

  const { data, error } = await db().from('profiles').update(update).eq('id', me.id).select('*').single();
  if (error) throw error;
  return json({ user: toUser(data as ProfileRow) });
});
