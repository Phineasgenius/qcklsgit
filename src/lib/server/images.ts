import { db } from './db';

export const IMAGE_BUCKET = 'question-images';
/** Files are named <uuid>.<ext> by the upload route; anything else is rejected. */
export const IMAGE_PATH_RE = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export function imageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  return db().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best effort: a leftover file is harmless, so failures are only logged. */
export async function removeImage(path: string | null | undefined): Promise<void> {
  if (!path) return;
  try {
    const { error } = await db().storage.from(IMAGE_BUCKET).remove([path]);
    if (error) console.error('[remove image]', error);
  } catch (err) {
    console.error('[remove image]', err);
  }
}
