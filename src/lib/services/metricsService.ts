import {
  getStudentPerformanceSnapshot,
  type StudentPerformanceSnapshotWithMeta,
} from "@/lib/performance";
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

const toStudentMetrics = (snapshot: StudentPerformanceSnapshot): StudentMetrics => ({
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

export type StudentClassroomMetricsResponse = {
  metrics: ClassroomMetrics;
  meta: {
    snapshotAgeSeconds: number;
    refreshStatus: StudentPerformanceSnapshotWithMeta["refreshStatus"];
    warning?: string;
  };
};

export const buildStudentClassroomMetrics = async (
  studentId: string
): Promise<StudentClassroomMetricsResponse> => {
  const {
    metrics: snapshot,
    snapshotAgeSeconds,
    warning,
    refreshStatus,
  } = await getStudentPerformanceSnapshot(studentId);
  const onTrackValue = Math.min(100, Math.max(0, Math.round(snapshot.overallScore)));
  const remaining = Math.max(0, 100 - onTrackValue);
  const acceleratedValue = Math.min(
    remaining,
    Math.max(0, Math.round(snapshot.growthRate / 2))
  );
  const watchValue = Math.max(0, remaining - acceleratedValue);

  const masteryDistribution: ClassroomMetric[] = [
    { label: "On Track", value: onTrackValue, helper: "Meeting mastery targets" },
    { label: "Watch", value: watchValue, helper: "Needs coaching" },
    {
      label: "Accelerated",
      value: acceleratedValue,
      helper: "Above grade level",
    },
  ];

  const topSubjects = snapshot.subjectMetrics
    .slice(0, 3)
    .map((subject) => ({
      ...subject,
      classAverage: Math.min(100, subject.classAverage + 2),
    }));

  return {
    metrics: {
      masteryDistribution,
      averageAttendance: Math.round(snapshot.attendanceRate),
      topSubjects,
    },
    meta: {
      snapshotAgeSeconds,
      refreshStatus,
      warning,
    },
  };
};

export const fetchStudentMetrics = async (
  studentId: string
): Promise<StudentMetrics> => {
  try {
    log("fetchStudentMetrics:start", { studentId });
    const snapshotEnvelope = await getStudentPerformanceSnapshot(studentId);
    const metrics = toStudentMetrics(snapshotEnvelope.metrics);
    log("fetchStudentMetrics:success");
    return {
      ...metrics,
      snapshot: {
        ageSeconds: snapshotEnvelope.snapshotAgeSeconds,
        refreshStatus: snapshotEnvelope.refreshStatus,
        warning: snapshotEnvelope.warning,
      },
    };
  } catch (error) {
    console.error("[metricsService] fetchStudentMetrics:error", error);
    throw new Error("Unable to load student metrics");
  }
};
