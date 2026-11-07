// Smart matching engine for Quiz Club KLS GIT
// Checks for both canonical answer and expected "funda" / connecting concept

export interface MatchResult {
  isMatch: boolean;
  confidence: number;
  reason: string;
  isFundaMatch: boolean;
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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

export function tokenDiceCoefficient(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let matches = 0;
  for (const tokenA of setA) {
    if (setB.has(tokenA)) {
      matches++;
    } else {
      for (const tokenB of setB) {
        if (stringSimilarity(tokenA, tokenB) >= 0.82) {
          matches += 0.9;
          break;
        }
      }
    }
  }

  return (2 * matches) / (setA.size + setB.size);
}

/**
 * Checks participant answer against canonical answer and expected funda
 */
export function checkAnswer(
  guess: string,
  canonicalAnswer: string,
  fundaText?: string,
  fundaKeywords: string[] = []
): MatchResult {
  const normGuess = normalizeText(guess);
  const normAnswer = normalizeText(canonicalAnswer);

  if (!normGuess) {
    return { isMatch: false, confidence: 0, reason: 'Answer cannot be empty.', isFundaMatch: false };
  }

  // 1. Direct match with canonical answer
  if (normGuess === normAnswer) {
    return { isMatch: true, confidence: 1.0, reason: 'Spot on! Correct answer.', isFundaMatch: false };
  }

  // 2. Direct string similarity (handles typos)
  const directSim = stringSimilarity(normGuess, normAnswer);
  if (directSim >= 0.82) {
    return {
      isMatch: true,
      confidence: directSim,
      reason: directSim >= 0.95 ? 'Spot on!' : 'Close enough! Spelling accepted.',
      isFundaMatch: false
    };
  }

  // 3. Substring match
  if (normAnswer.length > 3 && (normGuess.includes(normAnswer) || normAnswer.includes(normGuess))) {
    const minLen = Math.min(normGuess.length, normAnswer.length);
    const maxLen = Math.max(normGuess.length, normAnswer.length);
    if (minLen / maxLen >= 0.5) {
      return {
        isMatch: true,
        confidence: 0.9,
        reason: 'Correct! Main answer captured.',
        isFundaMatch: false
      };
    }
  }

  // 4. Token Overlap check on canonical answer
  const guessTokens = extractTokens(normGuess);
  const answerTokens = extractTokens(normAnswer);
  const diceSim = tokenDiceCoefficient(guessTokens, answerTokens);

  if (diceSim >= 0.70) {
    return {
      isMatch: true,
      confidence: diceSim,
      reason: 'Correct! Core answer captured.',
      isFundaMatch: false
    };
  }

  // 5. Expected Funda Matching
  // If the student gave the funda (expected concept/theme/connection)
  const allFundaPhrases: string[] = [];
  if (fundaText) {
    allFundaPhrases.push(fundaText);
    allFundaPhrases.push(...fundaText.split(/[,;/|]/));
  }
  if (fundaKeywords && fundaKeywords.length > 0) {
    allFundaPhrases.push(...fundaKeywords);
  }

  const cleanFundaPhrases = allFundaPhrases
    .map(p => normalizeText(p))
    .filter(p => p.length > 1);

  for (const phrase of cleanFundaPhrases) {
    // Check if guess contains the funda phrase or vice versa
    if (normGuess.includes(phrase) || (phrase.length > 3 && phrase.includes(normGuess))) {
      return {
        isMatch: true,
        confidence: 0.92,
        reason: 'Accepted! You cracked the expected funda of the question.',
        isFundaMatch: true
      };
    }

    // Similarity with funda phrase
    if (stringSimilarity(normGuess, phrase) >= 0.82) {
      return {
        isMatch: true,
        confidence: 0.88,
        reason: 'Accepted! Funda concept matched.',
        isFundaMatch: true
      };
    }

    // Token check on funda
    const phraseTokens = extractTokens(phrase);
    if (tokenDiceCoefficient(guessTokens, phraseTokens) >= 0.70) {
      return {
        isMatch: true,
        confidence: 0.86,
        reason: 'Accepted! Expected funda concept captured.',
        isFundaMatch: true
      };
    }
  }

  // If not matched
  const maxConfidence = Math.max(directSim, diceSim);
  return {
    isMatch: false,
    confidence: maxConfidence,
    reason: maxConfidence > 0.5 ? 'Very close, but missing the key connect. Try again!' : 'Incorrect. Check clues or try another guess.',
    isFundaMatch: false
  };
}
