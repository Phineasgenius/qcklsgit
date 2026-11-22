import { randomUUID } from 'crypto';
import { db } from '@/lib/server/db';
import { fail, handle, isQM, json } from '@/lib/server/helpers';
import { IMAGE_BUCKET, imageUrl } from '@/lib/server/images';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024;
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** The first bytes of the file must really be the type it claims to be. */
function looksLike(type: string, b: Buffer): boolean {
  if (type === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (type === 'image/png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  if (type === 'image/webp') return b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

export const POST = handle(async (req) => {
  if (!(await isQM())) return fail('Quizmaster access required.', 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail('Could not read the upload. Please try again.');
  }
  const file = form.get('file');
  if (!(file instanceof File)) return fail('Please choose an image file.');

  const ext = EXT[file.type];
  if (!ext) return fail('Only JPG, PNG or WebP images are allowed.');
  if (file.size > MAX_BYTES) return fail('The image is too large (4 MB maximum).');

  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksLike(file.type, buf)) return fail('This file is not a valid image.');

  const path = `${randomUUID()}.${ext}`;
  const { error } = await db().storage.from(IMAGE_BUCKET).upload(path, buf, {
    contentType: file.type,
    cacheControl: '31536000',
  });
  if (error) throw error;

  return json({ path, url: imageUrl(path) });
});
