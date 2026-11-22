import { db } from '@/lib/server/db';
import { fail, handle, isQM, json, readBody } from '@/lib/server/helpers';
import { parseQuestionInput, questionColumns, todayIST } from '@/lib/server/questionInput';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** PATCH = make this question the active Question of the Day. */
export const PATCH = handle<Ctx>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const { error } = await db().rpc('activate_question', { p_id: id });
  if (error) {
    if (/not found/i.test(error.message)) return fail('Question not found.', 404);
    throw error;
  }
  return json({ ok: true });
});

export const DELETE = handle<Ctx>(async (_req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;
  const q = await db().from('questions').select('status').eq('id', id).maybeSingle();
  if (!q.data) return fail('Question not found.', 404);
  if (q.data.status === 'active') return fail('This is the live question. Make another question active before deleting it.');
  const { error } = await db().from('questions').delete().eq('id', id);
  if (error) throw error;
  return json({ ok: true });
});

/** PUT = edit a question (answers, alternatives, explanation, hints, date). */
export const PUT = handle<Ctx>(async (req, { params }) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);
  const { id } = await params;

  const parsed = parseQuestionInput(await readBody(req));
  if ('error' in parsed) return fail(parsed.error);
  const v = parsed.value;

  const cur = await db().from('questions').select('id, parts, scheduled_date').eq('id', id).maybeSingle();
  if (!cur.data) return fail('Question not found.', 404);

  // The number of answers is locked once members have submitted (their per-part progress depends on it).
  const oldCount = Array.isArray(cur.data.parts) ? cur.data.parts.length : 1;
  if (v.parts.length !== oldCount) {
    const subs = await db().from('submissions').select('id', { count: 'exact', head: true }).eq('question_id', id);
    if ((subs.count ?? 0) > 0) {
      return fail('Members have already answered this question, so the number of answers cannot change. You can still edit the answers, alternatives and explanation.');
    }
  }

  if (v.scheduledDate && v.scheduledDate !== cur.data.scheduled_date && v.scheduledDate < todayIST()) {
    return fail('The date cannot be in the past.');
  }

  const { error } = await db().from('questions').update(questionColumns(v)).eq('id', id);
  if (error) {
    if (/scheduled_date/.test(`${error.message} ${error.details ?? ''}`)) {
      return fail('Another waiting question is already scheduled for that date.', 409);
    }
    throw error;
  }
  return json({ ok: true });
});