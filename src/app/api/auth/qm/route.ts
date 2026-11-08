import { createSession } from '@/lib/server/session';
import { fail, handle, json, qmUser, readBody, safeEqual, str } from '@/lib/server/helpers';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const expectedUser = process.env.QM_USERNAME;
  const expectedPass = process.env.QM_PASSWORD;
  if (!expectedUser || !expectedPass) return fail('Quizmaster login is not configured on the server.', 503);

  const b = await readBody(req);
  const username = str(b.username, 64);
  const password = typeof b.password === 'string' ? b.password : '';

  const userOk = safeEqual(username.toLowerCase(), expectedUser.toLowerCase());
  const passOk = safeEqual(password, expectedPass);
  if (!userOk || !passOk) return fail('Invalid Quizmaster credentials.', 401);

  await createSession('quizmaster', 'quizmaster');
  return json({ user: qmUser(), message: 'Quizmaster authorized. Welcome!' });
});
