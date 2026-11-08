import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE = 'qc_session';

export interface Session {
  sub: string;
  role: 'user' | 'quizmaster';
}

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET is missing or shorter than 32 characters.');
  }
  return new TextEncoder().encode(s);
}

export async function createSession(sub: string, role: 'user' | 'quizmaster') {
  const maxAge = role === 'quizmaster' ? 60 * 60 * 12 : 60 * 60 * 24 * 30;
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const role = payload.role === 'quizmaster' ? 'quizmaster' : 'user';
    return { sub: payload.sub, role };
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
