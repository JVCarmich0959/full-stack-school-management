export const GRADE_TOKENS = ["K", "1", "2", "3", "4", "5"] as const;
export type DirectoryGradeToken = (typeof GRADE_TOKENS)[number];

export const GRADE_TOKEN_TO_LEVEL: Record<DirectoryGradeToken, number> = {
  K: 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
};

export const GRADE_LABELS: Record<DirectoryGradeToken, string> = {
  K: "Kindergarten",
  "1": "Grade 1",
  "2": "Grade 2",
  "3": "Grade 3",
  "4": "Grade 4",
  "5": "Grade 5",
};

export const formatGradeLabel = (level?: number | null) => {
  if (level == null) {
    return "Unknown";
  }
  if (level === 0) {
    return "Kindergarten";
  }
  return `Grade ${level}`;
};

export const extractGradeToken = (value?: string): DirectoryGradeToken | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();

  // Accept variants such as "grade 3" or "Grade3"
  const match = normalized.match(/^(?:GRADE\s*)?(K|[1-5])$/i);
  if (match) {
    const token = match[1].toUpperCase();
    return GRADE_TOKENS.find((candidate) => candidate === token);
  }

  return undefined;
};

export const SORT_OPTIONS = ["grade_name", "name_asc", "created_desc"] as const;
export type DirectorySort = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<DirectorySort, string> = {
  grade_name: "Grade / Name",
  name_asc: "Name (A → Z)",
  created_desc: "Newest first",
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type DirectoryPageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const PAGE_SIZE_LABELS: Record<DirectoryPageSize, string> = {
  10: "10 rows",
  25: "25 rows",
  50: "50 rows",
};
