'use client';

import React from 'react';
import { BRANCHES, DESIGNATIONS, YEARS } from '@/lib/options';

export interface ProfileValues {
  designation: string;
  branch: string;
  year: string;
}

interface Props {
  values: ProfileValues;
  onChange: (v: ProfileValues) => void;
}

const selectCls =
  'w-full px-3.5 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm font-semibold shadow-[2px_2px_0_var(--ink)] focus:outline-none';
const labelCls = 'text-xs font-extrabold uppercase text-[var(--text-secondary)]';

export function ProfileFields({ values, onChange }: Props) {
  const set = (patch: Partial<ProfileValues>) => onChange({ ...values, ...patch });

  return (
    <>
      <div className="space-y-1">
        <label className={labelCls}>I am a</label>
        <select
          value={values.designation}
          onChange={(e) => {
            const designation = e.target.value;
            // Non-students usually have no "year"; pre-select N/A for convenience.
            set({ designation, year: designation && designation !== 'Student' && !values.year ? 'N/A' : values.year });
          }}
          className={selectCls}
        >
          <option value="">Select…</option>
          {DESIGNATIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={labelCls}>Branch</label>
          <select value={values.branch} onChange={(e) => set({ branch: e.target.value })} className={selectCls}>
            <option value="">Select…</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Year</label>
          <select value={values.year} onChange={(e) => set({ year: e.target.value })} className={selectCls}>
            <option value="">Select…</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
