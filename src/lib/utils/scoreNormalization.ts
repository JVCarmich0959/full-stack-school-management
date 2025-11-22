/**
 * @typedef {Object} SubjectScores
 * @property {number | undefined} math
 * @property {number | undefined} ela
 * @property {number | undefined} science
 */

export type SubjectScores = {
  math?: number;
  ela?: number;
  science?: number;
};

/**
 * Normalize subject scores to the [0,100] interval.
 * Ensures malformed inputs do not break charts.
 */
export const normalizeScores = (scores: SubjectScores): Required<SubjectScores> => {
  try {
    const entries = Object.entries(scores ?? {});
    if (entries.length === 0) {
      return { math: 0, ela: 0, science: 0 };
    }

    const clamp = (value?: number) => {
      if (typeof value !== "number" || Number.isNaN(value)) return 0;
      if (value < 0) {
        console.warn("[normalizeScores] value below 0 detected.");
        return 0;
      }
      if (value > 100) {
        console.warn("[normalizeScores] value above 100 detected.");
        return 100;
      }
      return Math.round(value);
    };

    return {
      math: clamp(scores.math),
      ela: clamp(scores.ela),
      science: clamp(scores.science),
    };
  } catch (error) {
    console.error("[normalizeScores] Failed to sanitize scores", error);
    return { math: 0, ela: 0, science: 0 };
  }
};

// Sample data for local testing or Storybook.
export const SAMPLE_RADAR_SCORES: SubjectScores = {
  math: 88,
  ela: 76,
  science: 92,
};

// TODO: Support customizable subject labels per school
