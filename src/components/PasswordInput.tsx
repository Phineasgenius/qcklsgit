'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

const base =
  'w-full pl-3.5 pr-11 py-2.5 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] text-sm shadow-[2px_2px_0_var(--ink)] focus:outline-none placeholder:text-[var(--text-muted)]';

/** Password field with a show / hide toggle. */
export function PasswordInput({ value, onChange, placeholder, autoComplete, className }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={className ?? base}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--ink)]"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
