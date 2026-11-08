// Small fetch helper used by every client component. All data lives in the database;
// the browser only talks to our own /api routes.
export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T & { error?: string };
}

export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: data as T & { error?: string } };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: 'Network error. Please check your connection and try again.' } as T & { error?: string },
    };
  }
}
