'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProfileFields, ProfileValues } from './ProfileFields';
import { UserCheck } from 'lucide-react';

/** Blocking modal shown to existing students who have not yet given year / branch / designation. */
export function ProfileCompleteModal() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [values, setValues] = useState<ProfileValues>({ designation: '', branch: '', year: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!currentUser || currentUser.role !== 'user' || !currentUser.needsProfile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!values.designation || !values.branch || !values.year) {
      setError('Please fill in all three fields to continue.');
      return;
    }
    setSaving(true);
    const res = await updateProfile(values);
    setSaving(false);
    if (!res.success) setError(res.message);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <form onSubmit={handleSave} className="card-neo w-full max-w-md p-6 bg-[var(--bg-secondary)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-[2px] border-[var(--ink)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--yellow)] border-[2px] border-[var(--ink)] flex items-center justify-center shadow-[2px_2px_0_var(--ink)]">
            <UserCheck className="w-5 h-5 text-[var(--ink)]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--ink)]">One last step</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Tell us a little more about you, {currentUser.name}.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl border-[2px] border-[var(--ink)] bg-[var(--red)]/20 text-xs font-bold text-[var(--ink)]">
            {error}
          </div>
        )}

        <ProfileFields values={values} onChange={setValues} />

        <div className="flex items-center justify-between gap-3 pt-1">
          <button type="button" onClick={logout} className="text-xs font-bold text-[var(--text-secondary)] hover:underline">
            Sign out
          </button>
          <button type="submit" disabled={saving} className="btn-neo btn-neo-primary text-xs !py-2.5 !px-5">
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
