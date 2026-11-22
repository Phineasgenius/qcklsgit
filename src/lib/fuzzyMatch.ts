// Answer matching for Quiz Club KLS GIT.
// Every answer part is checked ONLY against its own canonical answer and the alternative
// answers the Quizmaster typed in. There is no "funda" matching any more.

export interface PartMatch {
  isMatch: boolean;
  confidence: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'is', 'it', 'was', 'are', 'that', 'this', 'its', 'from', 'as', 'into', 'about'
]);

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"’“”]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(Boolean);
  const filtered = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);
  return filtered.length > 0 ? filtered : tokens;
}

export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return Math.max(0, 1 - levenshteinDistance(s1, s2) / maxLen);
}

/** Edit distance where swapping two neighbouring letters counts as ONE edit ("spian" -> "spain"). */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, dp[i - 2][j - 2] + 1);
      dp[i][j] = v;
    }
  }
  return dp[m][n];
}

/** Typos are forgiven only in longer words: exact under 6 letters, 1 edit for 6-10, 2 edits from 11. */
function allowedEdits(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  if (len < 6) return 0;
  if (len < 11) return 1;
  return 2;
}

const hasDigit = (s: string) => /\d/.test(s);

function similarEnough(a: string, b: string): boolean {
  if (a === b) return true;
  if (hasDigit(a) || hasDigit(b)) return false; // numbers and years must be exact
  return editDistance(a, b) <= allowedEdits(a, b);
}

/** Words of a normalized string; one leading "the / a / an" is ignored ("The Hindu" = "Hindu"). */
function words(norm: string): string[] {
  const w = norm.split(' ').filter(Boolean);
  if (w.length > 1 && (w[0] === 'the' || w[0] === 'a' || w[0] === 'an')) w.shift();
  return w;
}

function matchCandidate(guess: string, cand: string): number {
  if (!guess || !cand) return 0;
  if (guess === cand) return 1;

  const gc = guess.replace(/ /g, '');
  const cc = cand.replace(/ /g, '');
  if (gc === cc) return 0.98; // "spider man" = "spiderman"

  // Same words in any order, each word allowed a small typo.
  const gw = words(guess);
  const cw = words(cand);
  if (gw.length > 0 && gw.length === cw.length) {
    const used = new Set<number>();
    let allExact = true;
    let ok = true;
    for (const t of gw) {
      let found = -1;
      for (let k = 0; k < cw.length; k++) {
        if (!used.has(k) && cw[k] === t) { found = k; break; }
      }
      if (found === -1) {
        for (let k = 0; k < cw.length; k++) {
          if (!used.has(k) && similarEnough(t, cw[k])) { found = k; allExact = false; break; }
        }
      }
      if (found === -1) { ok = false; break; }
      used.add(found);
    }
    if (ok) return allExact ? 0.95 : 0.9;
  }

  return 0;
}

/** Is `guess` an accepted answer for one part? Only the canonical answer and listed alternatives count. */
export function checkPart(guess: string, answer: string, alternatives: string[] = []): PartMatch {
  const g = normalizeText(guess);
  if (!g) return { isMatch: false, confidence: 0 };
  let best = 0;
  for (const c of [answer, ...alternatives]) {
    const s = matchCandidate(g, normalizeText(c));
    if (s > best) best = s;
    if (best === 1) break;
  }
  return { isMatch: best > 0, confidence: best };
}
