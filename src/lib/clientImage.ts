// Browser-side helpers for the question picture: shrink big photos, then upload.

const MAX_SIDE = 1600;
const KEEP_AS_IS = 1.5 * 1024 * 1024;
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function prepareImage(file: File): Promise<File> {
  if (!TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error('This image could not be read.');
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size <= KEEP_AS_IS) {
    bmp.close();
    return file;
  }

  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bmp.close();
    throw new Error('This image could not be processed.');
  }
  ctx.fillStyle = '#ffffff'; // JPEG has no transparency
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('This image could not be processed.');
  if (blob.size > MAX_BYTES) throw new Error('The image is still too large. Please choose a smaller one.');
  return new File([blob], 'question.jpg', { type: 'image/jpeg' });
}

export async function uploadQuestionImage(file: File): Promise<{ path: string; url: string }> {
  const prepared = await prepareImage(file);
  const fd = new FormData();
  fd.append('file', prepared);

  const res = await fetch('/api/qm/images', { method: 'POST', body: fd });
  let data: { path?: string; url?: string; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok || !data.path || !data.url) throw new Error(data.error ?? 'Could not upload the image.');
  return { path: data.path, url: data.url };
}
