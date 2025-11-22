import type { SubjectMetric } from "@/types/metrics";

/**
 * Calculate the arithmetic mean of numeric values.
 * @param values - Array of numbers to average.
 */
export const calculateAverage = (values: number[]): number => {
  if (!values || values.length === 0) {
    return 0;
  }
  const safeValues = values.filter((value) => typeof value === "number");
  if (safeValues.length === 0) {
    return 0;
  }
  return Math.round(
    safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length
  );
};

/**
 * Aggregates subject metrics into { math, ela, science } averages.
 * @param metrics - Array of subject metrics to aggregate.
 */
export const calculateSubjectAverages = (
  metrics: SubjectMetric[]
): { math: number; ela: number; science: number } => {
  const groups: Record<string, number[]> = {
    math: [],
    ela: [],
    science: [],
  };

  metrics.forEach((metric) => {
    const key = metric.name.toLowerCase();
    if (key.includes("math")) {
      groups.math.push(metric.studentScore);
    } else if (key.includes("ela")) {
      groups.ela.push(metric.studentScore);
    } else if (key.includes("science")) {
      groups.science.push(metric.studentScore);
    }
  });

  return {
    math: calculateAverage(groups.math),
    ela: calculateAverage(groups.ela),
    science: calculateAverage(groups.science),
  };
};

// TODO: Add drill-down from class average to individual student view
