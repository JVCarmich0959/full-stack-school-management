import { getStudentPerformanceSnapshot } from "@/lib/performance";
import type {
  ClassroomMetric,
  ClassroomMetrics,
  StudentMetrics,
} from "@/types/metrics";

const log = (message: string, payload?: unknown) => {
  if (payload) {
    console.info(`[metricsService] ${message}`, payload);
  } else {
    console.info(`[metricsService] ${message}`);
  }
};

const toStudentMetrics = (snapshot: ReturnType<typeof getStudentPerformanceSnapshot>): StudentMetrics => ({
  overallScore: snapshot.overallScore,
  growthRate: snapshot.growthRate,
  attendanceRate: snapshot.attendanceRate,
  assignmentsCompleted: snapshot.assignments.completed,
  assignmentsTotal: snapshot.assignments.total,
  readingMinutes: snapshot.readingMinutes,
  mathFluency: snapshot.mathFluency,
  subjects: snapshot.subjectMetrics,
  assessments: snapshot.assessments,
});

const generateClassroomMetric = (
  seed: string,
  label: string,
  min: number,
  max: number,
  helper?: string
): ClassroomMetric => {
  const value =
    ((seed.charCodeAt(0) + label.charCodeAt(0)) % (max - min)) + min;
  return { label, value, helper };
};

export const buildStudentClassroomMetrics = (
  studentId: string
): ClassroomMetrics => {
  const masteryDistribution: ClassroomMetric[] = [
    generateClassroomMetric(studentId, "On Track", 60, 85, "Scholars meeting benchmarks"),
    generateClassroomMetric(studentId, "Watch", 10, 25, "Floor coaching needed"),
    generateClassroomMetric(studentId, "Accelerated", 5, 20, "Enrichment ready"),
  ];

  const topSubjects = getStudentPerformanceSnapshot(studentId).subjectMetrics
    .slice(0, 3)
    .map((subject) => ({
      ...subject,
      classAverage: Math.min(100, subject.classAverage + 2),
    }));

  return {
    masteryDistribution,
    averageAttendance: generateClassroomMetric(studentId, "Attendance", 92, 99).value,
    topSubjects,
  };
};

export const fetchStudentMetrics = async (
  studentId: string
): Promise<StudentMetrics> => {
  try {
    log("fetchStudentMetrics:start", { studentId });
    // TODO: Replace random data with live assessments
    const snapshot = getStudentPerformanceSnapshot(studentId);
    const metrics = toStudentMetrics(snapshot);
    log("fetchStudentMetrics:success");
    return metrics;
  } catch (error) {
    console.error("[metricsService] fetchStudentMetrics:error", error);
    throw new Error("Unable to load student metrics");
  }
};
