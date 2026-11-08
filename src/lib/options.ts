// Shared by the browser (forms) and the server (validation).
export const YEARS = ['1st', '2nd', '3rd', '4th', 'N/A'] as const;
export const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'AE', 'Architecture', 'MCA', 'B Des'] as const;
export const DESIGNATIONS = ['Student', 'Graduate', 'Professor/Faculty', 'Other'] as const;

export const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What was your childhood nickname?',
  'What is the name of your first pet (or a pet you wish you had)?',
  'Who was your favourite teacher?',
  'In which town or village did your grandparents live?',
] as const;

export function validateProfileFields(year: string, branch: string, designation: string): string | null {
  if (!(DESIGNATIONS as readonly string[]).includes(designation)) return 'Please select whether you are a Student, Graduate, Professor/Faculty or Other.';
  if (!(BRANCHES as readonly string[]).includes(branch)) return 'Please select your branch.';
  if (!(YEARS as readonly string[]).includes(year)) return 'Please select your year (or N/A).';
  return null;
}

export function validateSecurity(question: string, answer: string): string | null {
  if (!(SECURITY_QUESTIONS as readonly string[]).includes(question)) return 'Please choose a security question.';
  if (normalizeSecurityAnswer(answer).length < 2) return 'Please enter an answer to your security question (at least 2 characters).';
  return null;
}

/** Answers are compared case-insensitively and ignoring extra spaces. */
export function normalizeSecurityAnswer(answer: string): string {
  return answer.toLowerCase().replace(/\s+/g, ' ').trim();
}
