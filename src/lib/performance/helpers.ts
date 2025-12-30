export type SubjectMetric = {
  name: string;
  studentScore: number;
  classAverage: number;
};

export type AssessmentResult = {
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

export type ResultRecord = {
  score: number;
  exam?: {
    title: string;
    startTime: Date;
    lesson?: {
      subject?: {
        id: number;
        name: string;
      } | null;
    };
  };
  assignment?: {
    title: string;
    dueDate: Date;
    lesson?: {
      subject?: {
        id: number;
        name: string;
      } | null;
    };
  };
};

const canonicalSubjectName = (raw?: string): string => {
  if (!raw) return "General";
  const normalized = raw.trim().toLowerCase();
  if (normalized.includes("math")) return "Mathematics";
  if (normalized.includes("ela") || normalized.includes("english")) return "ELA";
  if (normalized.includes("science")) return "Science";
  if (normalized.includes("history") || normalized.includes("social")) return "Social Studies";
  return raw;
};

const formatQuarterLabel = (date: Date): string => {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} • ${date.getFullYear()}`;
};

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));
const clampGrowth = (value: number): number => Math.max(-20, Math.min(20, Math.round(value)));

const getResultTimestamp = (result: ResultRecord): Date | null => {
  if (result.exam?.startTime) return result.exam.startTime;
  if (result.assignment?.dueDate) return result.assignment.dueDate;
  return null;
};

const getSubjectFromRecord = (result: ResultRecord) => {
  const subject =
    result.exam?.lesson?.subject || result.assignment?.lesson?.subject;
  if (!subject) {
    return { id: null, name: "General" };
  }

  return {
    id: subject.id,
    name: canonicalSubjectName(subject.name),
  };
};

export const buildDefaultSubjects = (): SubjectMetric[] => [
  { name: "Mathematics", studentScore: 78, classAverage: 76 },
  { name: "ELA", studentScore: 81, classAverage: 79 },
  { name: "Science", studentScore: 74, classAverage: 73 },
  { name: "Social Studies", studentScore: 75, classAverage: 74 },
];

export const aggregateSubjectMetrics = (
  studentResults: ResultRecord[],
  classResults: ResultRecord[],
  maxSubjects = 4
): SubjectMetric[] => {
  const subjectStats = new Map<string, { total: number; count: number; id: number | null }>();
  const classStats = new Map<string, { total: number; count: number }>();

  for (const result of studentResults) {
    const { name, id } = getSubjectFromRecord(result);
    const existing = subjectStats.get(name);
    if (existing) {
      existing.total += result.score;
      existing.count += 1;
    } else {
      subjectStats.set(name, {
        total: result.score,
        count: 1,
        id,
      });
    }
  }

  for (const result of classResults) {
    const { name } = getSubjectFromRecord(result);
    const entry = classStats.get(name);
    if (entry) {
      entry.total += result.score;
      entry.count += 1;
    } else {
      classStats.set(name, { total: result.score, count: 1 });
    }
  }

  return Array.from(subjectStats.entries())
    .map(([name, stats]) => {
      const studentAvg = stats.count ? clampScore(stats.total / stats.count) : 0;
      const classEntry = classStats.get(name);
      const classAvg = classEntry
        ? clampScore(classEntry.total / classEntry.count)
        : studentAvg;

      return {
        name,
        studentScore: studentAvg,
        classAverage: classAvg,
      };
    })
    .sort((a, b) => b.studentScore - a.studentScore)
    .slice(0, maxSubjects);
};

export const determineAssessments = (
  results: ResultRecord[]
): AssessmentResult[] => {
  const sorted = [...results].sort((a, b) => {
    const aTime = getResultTimestamp(a)?.getTime() ?? 0;
    const bTime = getResultTimestamp(b)?.getTime() ?? 0;
    return bTime - aTime;
  });

  return sorted.slice(0, 3).map((result) => {
    const date = getResultTimestamp(result);
    return {
      name: result.exam?.title || result.assignment?.title || "Assessment",
      score: clampScore(result.score),
      dateLabel: date ? formatQuarterLabel(date) : "TBD",
    };
  });
};

export const computeGrowthRate = (results: ResultRecord[]): number => {
  if (results.length === 0) {
    return 0;
  }

  const sorted = [...results]
    .filter((result) => getResultTimestamp(result))
    .sort(
      (a, b) =>
        (getResultTimestamp(a)?.getTime() ?? 0) -
        (getResultTimestamp(b)?.getTime() ?? 0)
    );

  if (sorted.length < 2) {
    return 0;
  }

  const firstScore = sorted[0].score;
  const lastScore = sorted[sorted.length - 1].score;
  return clampGrowth(lastScore - firstScore);
};

export const calculateAttendanceRate = (
  attendanceRecords: { present: boolean }[]
): number => {
  if (attendanceRecords.length === 0) {
    return 96;
  }

  const presentCount = attendanceRecords.filter((record) => record.present).length;
  return clampScore(Math.round((presentCount / attendanceRecords.length) * 100));
};

export const estimateReadingMinutes = (
  subjectMetrics: SubjectMetric[]
): number => {
  const readingSubject = subjectMetrics.find((metric) =>
    /ELA|English|Reading/i.test(metric.name)
  );
  if (!readingSubject) {
    return 300;
  }

  return Math.min(
    420,
    Math.max(150, Math.round(readingSubject.studentScore * 4))
  );
};

export const estimateMathFluency = (subjectMetrics: SubjectMetric[]): number => {
  const mathSubject = subjectMetrics.find((metric) =>
    /Math|Mathematics/i.test(metric.name)
  );
  if (!mathSubject) {
    return 70;
  }

  return clampScore(mathSubject.studentScore + 5);
};

export const computeOverallScore = (results: ResultRecord[]): number => {
  if (results.length === 0) {
    return 82;
  }

  const total = results.reduce((sum, result) => sum + result.score, 0);
  return clampScore(total / results.length);
};

export const buildSnapshotFromRecords = ({
  studentResults,
  classResults,
  attendanceRecords,
  assignmentTotal,
}: {
  studentResults: ResultRecord[];
  classResults: ResultRecord[];
  attendanceRecords: { present: boolean }[];
  assignmentTotal: number;
}): StudentPerformanceSnapshot => {
  const subjectMetrics = aggregateSubjectMetrics(studentResults, classResults);
  const finalSubjectMetrics =
    subjectMetrics.length > 0 ? subjectMetrics : buildDefaultSubjects();

  const assessments = determineAssessments(studentResults);
  const growthRate = computeGrowthRate(studentResults);
  const attendanceRate = calculateAttendanceRate(attendanceRecords);
  const overallScore = computeOverallScore(studentResults);

  const assignmentsCompleted = studentResults.filter(
    (result) => result.assignment
  ).length;

  return {
    overallScore,
    growthRate,
    attendanceRate,
    assignments: {
      completed: assignmentsCompleted,
      total: Math.max(assignmentTotal, assignmentsCompleted),
    },
    readingMinutes: estimateReadingMinutes(finalSubjectMetrics),
    mathFluency: estimateMathFluency(finalSubjectMetrics),
    subjectMetrics: finalSubjectMetrics,
    assessments,
  };
};
