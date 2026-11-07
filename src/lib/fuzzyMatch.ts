// Smart fuzzy matching engine for Quiz Club KLS GIT
// Specifically handles "give funda" questions with conceptual & typo tolerance

export interface MatchResult {
  isMatch: boolean;
  confidence: number; // 0 to 1
  reason: string;
  isCloseEnough: boolean;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
  'is', 'it', 'was', 'are', 'that', 'this', 'its', 'from', 'as', 'into', 'about'
]);

/**
 * Clean and normalize text:
 * lowercase, remove diacritics, strip punctuation, normalize spaces
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/['"’“”]/g, '')         // remove quotes
    .replace(/[^a-z0-9\s]/g, ' ')   // replace non-alphanumeric with spaces
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim();
}

/**
 * Extract meaningful semantic tokens (excluding common filler words)
 */
export function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(Boolean);
  const filtered = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);
  return filtered.length > 0 ? filtered : tokens;
}

/**
 * Compute Levenshtein distance between two strings
 */
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
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity between 0 and 1 based on Levenshtein distance
 */
export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Token Overlap (Sørensen-Dice Coefficient) between token sets
 */
export function tokenDiceCoefficient(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let matches = 0;
  for (const tokenA of setA) {
    if (setB.has(tokenA)) {
      matches++;
    } else {
      // Allow minor typo in tokens (e.g. 1 char typo)
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
 * Evaluates participant guess against question answer and funda keywords
 */
export function checkAnswer(
  guess: string,
  canonicalAnswer: string,
  fundaKeywords: string[] = [],
  isFunda: boolean = false
): MatchResult {
  const normGuess = normalizeText(guess);
  const normAnswer = normalizeText(canonicalAnswer);

  if (!normGuess) {
    return { isMatch: false, confidence: 0, reason: 'Answer cannot be empty.', isCloseEnough: false };
  }

  // 1. Direct exact match
  if (normGuess === normAnswer) {
    return { isMatch: true, confidence: 1.0, reason: 'Spot on! Exact match.', isCloseEnough: false };
  }

  // 2. Direct string similarity (handles typos)
  const directSim = stringSimilarity(normGuess, normAnswer);
  if (directSim >= 0.82) {
    return {
      isMatch: true,
      confidence: directSim,
      reason: directSim >= 0.95 ? 'Spot on!' : 'Close enough! Accepted typo/spelling variation.',
      isCloseEnough: directSim < 0.95
    };
  }

  // 3. Substring inclusion (e.g. user typed full name or main title)
  if (normAnswer.length > 3 && (normGuess.includes(normAnswer) || normAnswer.includes(normGuess))) {
    const minLen = Math.min(normGuess.length, normAnswer.length);
    const maxLen = Math.max(normGuess.length, normAnswer.length);
    const lengthRatio = minLen / maxLen;
    if (lengthRatio >= 0.55) {
      return {
        isMatch: true,
        confidence: 0.85 * lengthRatio + 0.15,
        reason: 'Close enough! Substring/title match acknowledged.',
        isCloseEnough: true
      };
    }
  }

  // 4. Token Overlap check
  const guessTokens = extractTokens(normGuess);
  const answerTokens = extractTokens(normAnswer);
  const diceSim = tokenDiceCoefficient(guessTokens, answerTokens);

  if (diceSim >= 0.72) {
    return {
      isMatch: true,
      confidence: diceSim,
      reason: 'Close enough! Key concepts and words aligned.',
      isCloseEnough: true
    };
  }

  // 5. "Give Funda" conceptual matching
  // If question is marked as "give funda" or funda keywords are provided
  if (isFunda || fundaKeywords.length > 0) {
    // Normalise all accepted funda keywords / alternative phrases
    const cleanKeywords = fundaKeywords
      .map(k => normalizeText(k))
      .filter(k => k.length > 0);

    let matchedKeywordCount = 0;
    for (const keyword of cleanKeywords) {
      // Check if keyword is in guess
      if (normGuess.includes(keyword)) {
        matchedKeywordCount++;
      } else {
        // Token check
        const kwTokens = extractTokens(keyword);
        const kwDice = tokenDiceCoefficient(guessTokens, kwTokens);
        if (kwDice >= 0.7) {
          matchedKeywordCount++;
        }
      }
    }

    if (cleanKeywords.length > 0 && matchedKeywordCount >= Math.min(2, cleanKeywords.length)) {
      return {
        isMatch: true,
        confidence: 0.88,
        reason: `Funda cracked! Matched essential concepts (${matchedKeywordCount} of ${cleanKeywords.length} funda markers).`,
        isCloseEnough: true
      };
    }

    // Also check semicolon/comma split alternative answers in canonicalAnswer
    // E.g. QM may write "Schrödinger's Cat; Superposition; Copenhagen Interpretation"
    const splitAlternatives = canonicalAnswer
      .split(/[,;/|]/)
      .map(a => normalizeText(a))
      .filter(a => a.length > 0);

    for (const alt of splitAlternatives) {
      const altSim = stringSimilarity(normGuess, alt);
      if (altSim >= 0.80) {
        return {
          isMatch: true,
          confidence: altSim,
          reason: 'Funda accepted! Matched acceptable alternative answer.',
          isCloseEnough: true
        };
      }
      const altTokens = extractTokens(alt);
      const altDice = tokenDiceCoefficient(guessTokens, altTokens);
      if (altDice >= 0.70) {
        return {
          isMatch: true,
          confidence: altDice,
          reason: 'Funda accepted! Conceptual answer captured.',
          isCloseEnough: true
        };
      }
    }
  }

  // If not matched, provide encouraging feedback
  const maxScore = Math.max(directSim, diceSim);
  return {
    isMatch: false,
    confidence: maxScore,
    reason: maxScore > 0.5 ? 'Very close, but missing the key link. Try another angle!' : 'Not quite. Check the clues or try another guess!',
    isCloseEnough: false
  };
}
