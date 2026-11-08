'use client';

import React from 'react';
import { SECURITY_QUESTIONS } from '@/lib/options';

export interface SecurityValues {
  question: string;
  answer: string;
}

interface Props {
  values: SecurityValues;
  onChange: (v: SecurityValues) => void;
  optional?: boolean;
}

const fieldCls =
  'w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm font-semibold shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal';
const labelCls = 'text-xs font-extrabold uppercase text-[var(--text-secondary)]';

/** Security question + answer, used if the member forgets their password. */
export function SecurityFields({ values, onChange, optional }: Props) {
  return (
    <>
      <div className="space-y-1">
        <label className={labelCls}>Security question {optional ? '(leave blank to keep current)' : '(for password reset)'}</label>
        <select value={values.question} onChange={(e) => onChange({ ...values, question: e.target.value })} className={fieldCls}>
          <option value="">Select a question…</option>
          {SECURITY_QUESTIONS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className={labelCls}>Your answer</label>
        <input
          type="text"
          value={values.answer}
          onChange={(e) => onChange({ ...values, answer: e.target.value })}
          placeholder="Something only you would know"
          autoComplete="off"
          className={fieldCls}
        />
      </div>
    </>
  );
}
