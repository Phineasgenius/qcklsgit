import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { db } from './db';
import { getSession, clearSession } from './session';
import type { User } from '@/types';

export interface ProfileRow {
  id: string;
  name: string;
  uid: string;
  role: 'user' | 'quizmaster';
  password_hash: string;
  points: number;
  correct_count: number;
  wrong_count: number;
  year: string | null;
  branch: string | null;
  designation: string | null;
  created_at: string;
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function fail(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ error: message, ...extra }, status);
}

/** Wraps a route handler so unexpected errors become a clean 500 instead of leaking details. */
export function handle<C = unknown>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error('[api error]', err);
      return fail('Something went wrong on the server. Please try again.', 500);
    }
  };
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function str(v: unknown, max = 500): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function toUser(p: ProfileRow): User {
  return {
    id: p.id,
    name: p.name,
    uid: p.uid,
    role: p.role,
    points: p.points,
    correctCount: p.correct_count,
    wrongCount: p.wrong_count,
    year: p.year,
    branch: p.branch,
    designation: p.designation,
    needsProfile: p.role === 'user' && (!p.year || !p.branch || !p.designation),
    createdAt: p.created_at,
  };
}

export function qmUser(): User {
  return {
    id: 'quizmaster',
    name: 'Quizmaster',
    uid: (process.env.QM_USERNAME || 'quizmaster').toLowerCase(),
    role: 'quizmaster',
    points: 0,
    correctCount: 0,
    wrongCount: 0,
    createdAt: new Date(0).toISOString(),
  };
}

/** Returns the signed-in student's profile row, or null. */
export async function requireUser(): Promise<ProfileRow | null> {
  const s = await getSession();
  if (!s || s.role !== 'user') return null;
  const { data } = await db().from('profiles').select('*').eq('id', s.sub).eq('role', 'user').maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function isQM(): Promise<boolean> {
  const s = await getSession();
  return !!s && s.role === 'quizmaster';
}

/** Current user (student or quizmaster) for /api/auth/me. Clears the cookie if the account vanished. */
export async function currentUser(): Promise<User | null> {
  const s = await getSession();
  if (!s) return null;
  if (s.role === 'quizmaster') return qmUser();
  const p = await requireUser();
  if (!p) {
    await clearSession();
    return null;
  }
  return toUser(p);
}

export async function freshUser(id: string): Promise<User | null> {
  const { data } = await db().from('profiles').select('*').eq('id', id).maybeSingle();
  return data ? toUser(data as ProfileRow) : null;
}
