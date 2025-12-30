import prisma from "@/lib/prisma";
import { calculateAverage, calculateSubjectAverages } from "@/lib/metrics";
import {
  ensureClassroomSnapshots,
  getSnapshotQueueDepth,
} from "@/lib/performance";
import type { ClassroomMetrics } from "@/types/metrics";
import type { SnapshotStatus } from "@prisma/client";

export type TeacherClassroomMetricsResponse = {
  metrics: ClassroomMetrics;
  meta: {
    maxSnapshotAgeSeconds: number;
    warnings: string[];
    queueDepth: number;
    refreshStatus?: SnapshotStatus;
  };
};

export const buildTeacherClassroomMetrics = async (
  teacherId: string
): Promise<TeacherClassroomMetricsResponse> => {
  const classroom = await prisma.class.findFirst({
    where: { supervisorId: teacherId },
    select: { id: true },
  });

  if (!classroom) {
    return {
      metrics: {
        masteryDistribution: [],
        averageAttendance: 0,
        topSubjects: [],
        subjectAverages: { math: 0, ela: 0, science: 0 },
        dataQuality: {
          missingContacts: 0,
          lowAssessmentCoverage: 0,
        },
      },
      meta: {
        maxSnapshotAgeSeconds: 0,
        warnings: [],
        queueDepth: await getSnapshotQueueDepth(),
      },
    };
  }

  const snapshots = await ensureClassroomSnapshots(classroom.id);

  if (snapshots.length === 0) {
    return {
      metrics: {
        masteryDistribution: [],
        averageAttendance: 0,
        topSubjects: [],
        subjectAverages: { math: 0, ela: 0, science: 0 },
        dataQuality: {
          missingContacts: 0,
          lowAssessmentCoverage: 0,
        },
      },
      meta: {
        maxSnapshotAgeSeconds: 0,
        warnings: [],
        queueDepth: await getSnapshotQueueDepth(),
      },
    };
  }

  const averages = calculateSubjectAverages(
    snapshots.flatMap((snapshot) => snapshot.metrics.subjectMetrics)
  );

  const totalStudents = snapshots.length;
  const onTrackCount = snapshots.filter(
    (snapshot) => snapshot.metrics.overallScore >= 80
  ).length;
  const watchCount = snapshots.filter(
    (snapshot) =>
      snapshot.metrics.overallScore >= 60 &&
      snapshot.metrics.overallScore < 80
  ).length;
  const acceleratedCount = snapshots.filter(
    (snapshot) => snapshot.metrics.overallScore >= 90
  ).length;

  const masteryDistribution: ClassroomMetrics["masteryDistribution"] = [
    {
      label: "On Track",
      value: Math.round((onTrackCount / totalStudents) * 100),
      helper: "Meeting mastery targets",
    },
    {
      label: "Watch",
      value: Math.round((watchCount / totalStudents) * 100),
      helper: "Needs coaching",
    },
    {
      label: "Accelerated",
      value: Math.min(
        100,
        Math.round((acceleratedCount / totalStudents) * 100)
      ),
      helper: "Above grade level",
    },
  ];

  const attendanceAvg = calculateAverage(
    snapshots.map((snapshot) => snapshot.metrics.attendanceRate)
  );

  const dataQualityMissing = snapshots.filter(
    (snapshot) => !snapshot.guardianEmail
  ).length;

  const lowAssessmentCoverage = snapshots.filter(
    (snapshot) => snapshot.metrics.assessments.length < 2
  ).length;

  const warnings = snapshots
    .map((entry) => entry.warning)
    .filter((warning): warning is string => Boolean(warning));
  const maxSnapshotAgeSeconds = Math.max(
    ...snapshots.map((entry) => entry.snapshotAgeSeconds),
    0
  );
  const queueDepth = await getSnapshotQueueDepth();

  const refreshStatus =
    snapshots.some((entry) => entry.refreshStatus === SnapshotStatus.FAILED)
      ? SnapshotStatus.FAILED
      : snapshots.some((entry) => entry.refreshStatus !== SnapshotStatus.READY)
      ? SnapshotStatus.PENDING
      : SnapshotStatus.READY;

  return {
    metrics: {
      masteryDistribution,
      averageAttendance: attendanceAvg,
      topSubjects: Object.entries(averages).map(([name, value]) => ({
        name: name.toUpperCase(),
        studentScore: value,
        classAverage: value,
      })),
      subjectAverages: averages,
      dataQuality: {
        missingContacts: dataQualityMissing,
        lowAssessmentCoverage,
      },
    },
    meta: {
      maxSnapshotAgeSeconds,
      warnings,
      queueDepth,
      refreshStatus,
    },
  };
};
