import type { SnapshotStatus } from "@prisma/client";

export type SubjectMetric = {
  name: string;
  studentScore: number;
  classAverage: number;
};

export type AssessmentMetric = {
  name: string;
  score: number;
  dateLabel: string;
};

export type StudentMetrics = {
  overallScore: number;
  growthRate: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  readingMinutes: number;
  mathFluency: number;
  subjects: SubjectMetric[];
  assessments: AssessmentMetric[];
  snapshot?: {
    ageSeconds: number;
    refreshStatus: SnapshotStatus;
    warning?: string;
  };
};

export type ClassroomMetric = {
  label: string;
  value: number;
  helper?: string;
};

export type ClassroomMetrics = {
  masteryDistribution: ClassroomMetric[];
  averageAttendance: number;
  topSubjects: SubjectMetric[];
  subjectAverages?: {
    math: number;
    ela: number;
    science: number;
  };
  dataQuality?: {
    missingContacts: number;
    lowAssessmentCoverage: number;
  };
};
