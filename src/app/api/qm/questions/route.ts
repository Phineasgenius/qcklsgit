import { db } from '@/lib/server/db';
import { fail, handle, isQM, json, readBody } from '@/lib/server/helpers';
import { partsOf, type QuestionRow } from '@/lib/server/qotd';
import { parseQuestionInput, questionColumns, todayIST } from '@/lib/server/questionInput';

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
    answer: partsOf(q).map((p) => p.answer).join(' / '),
    parts: partsOf(q),
    explanation: q.explanation ?? undefined,
    status: q.status,
    scheduledDate: q.scheduled_date ?? undefined,
    createdAt: q.created_at,
  }));
  return json({ questions });
});

export const POST = handle(async (req) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);

  const parsed = parseQuestionInput(await readBody(req));
  if ('error' in parsed) return fail(parsed.error);
  const v = parsed.value;
  if (v.scheduledDate && v.scheduledDate < todayIST()) return fail('The date cannot be in the past.');

  const last = await db().from('questions').select('edition').order('edition', { ascending: false }).limit(1);
  const nextEdition = ((last.data?.[0]?.edition as number | undefined) ?? 0) + 1;

  const { error } = await db().from('questions').insert({
    edition: nextEdition,
    ...questionColumns(v),
    status: 'draft',
  });
  if (error) {
    if (/scheduled_date/.test(`${error.message} ${error.details ?? ''}`)) {
      return fail('Another waiting question is already scheduled for that date.', 409);
    }
    throw error;
  }
  return json({ ok: true, edition: nextEdition });
});