// Shared by the browser (forms) and the server (validation).
export const YEARS = ['1st', '2nd', '3rd', '4th', 'N/A'] as const;
export const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'Architecture', 'MCA', 'B Des'] as const;
export const DESIGNATIONS = ['Student', 'Graduate', 'Professor/Faculty', 'Other'] as const;

export function validateProfileFields(year: string, branch: string, designation: string): string | null {
  if (!(DESIGNATIONS as readonly string[]).includes(designation)) return 'Please select whether you are a Student, Graduate, Professor/Faculty or Other.';
  if (!(BRANCHES as readonly string[]).includes(branch)) return 'Please select your branch.';
  if (!(YEARS as readonly string[]).includes(year)) return 'Please select your year (or N/A).';
  return null;
}
