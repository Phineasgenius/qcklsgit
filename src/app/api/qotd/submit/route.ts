import { db } from '@/lib/server/db';
import { fail, freshUser, handle, json, readBody, requireUser, str } from '@/lib/server/helpers';
import { buildState, getActiveQuestion, maxAttemptsFor, partsOf, pointsPerPart, solvedPartsFor } from '@/lib/server/qotd';
import { checkPart } from '@/lib/fuzzyMatch';
import { streaksFor } from '@/lib/server/board';
import { applyFreezes, awardCoins } from '@/lib/server/coins';
import { istDay } from '@/lib/server/streak';
import { streakBonus } from '@/lib/shop';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const me = await requireUser();
  if (!me) return fail('Please sign in to answer.', 401);

  const b = await readBody(req);

  const q = await getActiveQuestion();
  if (!q) return fail('There is no active question right now.', 404);

  // The page may have been open since before midnight: never grade an answer against a different question.
  if (typeof b.questionId === 'string' && b.questionId && b.questionId !== q.id) {
    return fail('A new question has just gone live. Please read it before answering.', 409, { state: await buildState(me.id) });
  }

  // A tab left open since yesterday must still get its freezes applied before today's answer is saved.
  await applyFreezes(me.id);

  const parts = partsOf(q);
  // New clients send one guess per part; an old open page sends a single "guess".
  const raw: unknown[] = Array.isArray(b.guesses) ? b.guesses : parts.length === 1 && typeof b.guess === 'string' ? [b.guess] : [];
  const guesses = parts.map((_, i) => str(raw[i], 300));

  const solved = new Set(await solvedPartsFor(me.id, q.id, parts.length));
  const todo = parts.map((_, i) => i).filter((i) => !solved.has(i));
  if (todo.every((i) => !guesses[i])) {
    return fail(parts.length === 1 ? 'Answer is empty. Please enter your answer.' : 'Please answer at least one part.');
  }

  const unlocks = await db().from('hint_unlocks').select('tier').eq('user_id', me.id).eq('question_id', q.id);
  const tiers = ((unlocks.data ?? []) as { tier: string }[]).map((r) => r.tier);
  const shares = pointsPerPart(tiers, parts.length);

  // Each part is checked only against its own answers.
  const results = todo.map((i) => {
    const g = guesses[i];
    const m = g ? checkPart(g, parts[i].answer, parts[i].alternatives) : { isMatch: false, confidence: 0 };
    return { idx: i, label: parts[i].label, guess: g, correct: m.isMatch, points: m.isMatch ? shares[i] : 0, confidence: m.confidence };
  });

  const nowSolved = new Set<number>([...solved, ...results.filter((r) => r.correct).map((r) => r.idx)]);
  const complete = nowSolved.size >= parts.length;

  let feedback: string;
  if (parts.length === 1) {
    feedback = complete ? 'Spot on! Correct answer.' : 'Incorrect. Check clues or try another guess.';
  } else {
    const marks = parts.map((p, i) => `${p.label} ${nowSolved.has(i) ? '✓' : '✗'}`).join(' • ');
    feedback = complete ? `All answers correct! (${marks})` : marks;
  }

  const guessText =
    parts.length === 1
      ? guesses[0]
      : results.filter((r) => r.guess).map((r) => `${r.label}: ${r.guess}`).join(' | ');
  const avg = results.reduce((sum, r) => sum + r.confidence, 0) / Math.max(1, results.length);

  const { error } = await db().rpc('submit_answer', {
    p_user_id: me.id,
    p_question_id: q.id,
    p_guess: guessText,
    p_hints: tiers,
    p_parts: results.map(({ idx, label, guess, correct, points }) => ({ idx, label, guess, correct, points })),
    p_total_parts: parts.length,
    p_score: Number((avg * 100).toFixed(2)),
    p_feedback: feedback,
    p_forfeit: false,
    p_max_attempts: maxAttemptsFor(q),
  });

  if (error) {
    if (/already_finished|no_attempts_left|23505/.test(`${error.message} ${error.code}`)) {
      return fail('You have no attempts left for this question.', 409, { state: await buildState(me.id) });
    }
    throw error;
  }

  // Streak milestones (10, 50, every 100th day) pay bonus coins, once per day.
  if (complete) {
    try {
      const current = (await streaksFor([me.id])).get(me.id)?.current ?? 0;
      const bonus = streakBonus(current);
      if (bonus > 0) await awardCoins(me.id, bonus, 'streak', `${current}@${istDay(Date.now())}`);
    } catch (err) {
      console.error('[streak bonus]', err);
    }
  }

  return json({ state: await buildState(me.id), user: await freshUser(me.id) });
});