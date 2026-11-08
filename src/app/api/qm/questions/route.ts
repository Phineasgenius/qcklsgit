import { db } from '@/lib/server/db';
import { fail, handle, isQM, json, readBody, str } from '@/lib/server/helpers';
import type { QuestionRow } from '@/lib/server/qotd';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { data, error } = await db().from('questions').select('*').order('edition', { ascending: false });
  if (error) throw error;
  const questions = ((data ?? []) as QuestionRow[]).map((q) => ({
    id: q.id,
    edition: q.edition,
    title: q.title,
    questionText: q.question_text,
    hints: {
      difficult: q.hint_difficult ?? undefined,
      medium: q.hint_medium ?? undefined,
      easy: q.hint_easy ?? undefined,
    },
    answer: q.answer,
    funda: q.funda ?? undefined,
    status: q.status,
    createdAt: q.created_at,
  }));
  return json({ questions });
});

export const POST = handle(async (req) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const b = await readBody(req);

  const title = str(b.title, 200);
  const questionText = str(b.questionText, 2000);
  const hintDifficult = str(b.hintDifficult, 1000);
  const hintMedium = str(b.hintMedium, 1000);
  const hintEasy = str(b.hintEasy, 1000);
  const answer = str(b.answer, 300);
  const funda = str(b.funda, 500);

  if (!title) return fail('Question title is empty.');
  if (!questionText) return fail('Question text is empty.');
  if (!hintDifficult) return fail('Hint 1 is empty. Please provide at least the first clue.');
  if (!answer) return fail('Canonical answer is empty.');

  const last = await db().from('questions').select('edition').order('edition', { ascending: false }).limit(1);
  const nextEdition = ((last.data?.[0]?.edition as number | undefined) ?? 0) + 1;

  const { error } = await db().from('questions').insert({
    edition: nextEdition,
    title,
    question_text: questionText,
    hint_difficult: hintDifficult || null,
    hint_medium: hintMedium || null,
    hint_easy: hintEasy || null,
    answer,
    funda: funda || null,
    funda_keywords: funda ? funda.split(/[,;/|]/).map((k) => k.trim()).filter(Boolean) : [],
    is_funda: Boolean(funda),
    status: 'draft',
  });
  if (error) throw error;
  return json({ ok: true, edition: nextEdition });
});
