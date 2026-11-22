import { str } from './helpers';
import type { PartRow } from './qotd';

export const MAX_PARTS = 5;

/** Today's date in IST as YYYY-MM-DD. */
export function todayIST(): string {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function validDate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
}

export interface ParsedQuestion {
  title: string;
  questionText: string;
  hintDifficult: string;
  hintMedium: string;
  hintEasy: string;
  explanation: string;
  parts: PartRow[];
  scheduledDate: string;
}

/** Validates the body sent by the Quizmaster console (used for both create and edit). */
export function parseQuestionInput(b: Record<string, unknown>): { value: ParsedQuestion } | { error: string } {
  const title = str(b.title, 200);
  const questionText = str(b.questionText, 2000);
  const hintDifficult = str(b.hintDifficult, 1000);
  const hintMedium = str(b.hintMedium, 1000);
  const hintEasy = str(b.hintEasy, 1000);
  const explanation = str(b.explanation !== undefined ? b.explanation : b.funda, 1500);
  const scheduledDate = str(b.scheduledDate, 10);

  if (!title) return { error: 'Question title is empty.' };
  if (!questionText) return { error: 'Question text is empty.' };
  if (!hintDifficult) return { error: 'Hint 1 is empty. Please provide at least the first clue.' };
  if (scheduledDate && !validDate(scheduledDate)) return { error: 'The date is not valid.' };

  // Older clients sent a single "answer"; treat it as a 1-part question.
  let rawParts: unknown[] = Array.isArray(b.parts) ? b.parts : [];
  if (rawParts.length === 0 && typeof b.answer === 'string') rawParts = [{ label: '', answer: b.answer, alternatives: [] }];
  if (rawParts.length < 1 || rawParts.length > MAX_PARTS) {
    return { error: `A question needs between 1 and ${MAX_PARTS} answers.` };
  }

  const multi = rawParts.length > 1;
  const labels = new Set<string>();
  const parts: PartRow[] = [];

  for (let i = 0; i < rawParts.length; i++) {
    const r = (rawParts[i] ?? {}) as Record<string, unknown>;
    const answer = str(r.answer, 300);
    const label = multi ? str(r.label, 20) : '';
    if (!answer) return { error: multi ? `Answer ${i + 1} is empty.` : 'Canonical answer is empty.' };
    if (multi) {
      if (!label) return { error: `Answer ${i + 1} needs a label (like X or Y).` };
      const key = label.toLowerCase();
      if (labels.has(key)) return { error: `The label "${label}" is used twice.` };
      labels.add(key);
    }

    const rawAlts: unknown[] = Array.isArray(r.alternatives)
      ? r.alternatives
      : typeof r.alternatives === 'string'
      ? r.alternatives.split('\n')
      : [];
    const alternatives: string[] = [];
    for (const a of rawAlts) {
      const t = str(a, 300);
      const low = t.toLowerCase();
      if (!t || low === answer.toLowerCase() || alternatives.some((x) => x.toLowerCase() === low)) continue;
      alternatives.push(t);
      if (alternatives.length >= 25) break;
    }
    parts.push({ label, answer, alternatives });
  }

  return { value: { title, questionText, hintDifficult, hintMedium, hintEasy, explanation, parts, scheduledDate } };
}

/** Database columns for a parsed question. Old funda columns are left empty on purpose. */
export function questionColumns(v: ParsedQuestion) {
  return {
    title: v.title,
    question_text: v.questionText,
    hint_difficult: v.hintDifficult || null,
    hint_medium: v.hintMedium || null,
    hint_easy: v.hintEasy || null,
    answer: v.parts.map((p) => p.answer).join(' / ').slice(0, 1000),
    parts: v.parts,
    explanation: v.explanation || null,
    funda: null,
    funda_keywords: [] as string[],
    is_funda: false,
    scheduled_date: v.scheduledDate || null,
  };
}
