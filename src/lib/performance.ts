type SubjectMetric = {
  name: string;
  studentScore: number;
  classAverage: number;
};

type AssessmentResult = {
  name: string;
  score: number;
  dateLabel: string;
};

export type StudentPerformanceSnapshot = {
  overallScore: number;
  growthRate: number;
  attendanceRate: number;
  assignments: {
    completed: number;
    total: number;
  };
  readingMinutes: number;
  mathFluency: number;
  subjectMetrics: SubjectMetric[];
  assessments: AssessmentResult[];
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

const toScore = (rand: number, min: number, max: number) =>
  Math.round(min + rand * (max - min));

export const getStudentPerformanceSnapshot = (
  studentId: string
): StudentPerformanceSnapshot => {
  const random = seededRandom(hashString(studentId));

  const subjects = ["Math", "ELA", "Science", "Social Studies"];
  const subjectMetrics: SubjectMetric[] = subjects.map((name, idx) => {
    const studentScore = toScore(random(), 68, 98);
    const classAvg = toScore(random(), 65, 92);
    return {
      name,
      studentScore,
      classAverage: Math.min(classAvg, studentScore + toScore(random(), -5, 5)),
    };
  });

  const assessments: AssessmentResult[] = Array.from({ length: 3 }).map(
    (_, idx) => ({
      name: `${subjects[idx]} Benchmark`,
      score: toScore(random(), 70, 98),
      dateLabel: `Q${idx + 1} • ${2024 + (idx > 1 ? 1 : 0)}`,
    })
  );

  return {
    overallScore: toScore(random(), 74, 97),
    growthRate: toScore(random(), 4, 18),
    attendanceRate: toScore(random(), 90, 99),
    assignments: {
      completed: toScore(random(), 16, 24),
      total: 25,
    },
    readingMinutes: toScore(random(), 250, 420),
    mathFluency: toScore(random(), 70, 95),
    subjectMetrics,
    assessments,
  };
};
