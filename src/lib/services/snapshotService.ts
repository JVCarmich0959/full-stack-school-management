import type { Prisma, SnapshotStatus, SnapshotTaskStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  buildSnapshotFromRecords,
  StudentPerformanceSnapshot,
  type ResultRecord,
} from "@/lib/performance/helpers";
import { SnapshotPolicy, SnapshotPolicyVersion } from "@/lib/freshnessPolicy";

export { SnapshotPolicy, SnapshotPolicyVersion };

const SNAPSHOT_TTL_SECONDS = SnapshotPolicy.staleThresholdSeconds;
const SNAPSHOT_TTL_MS = SNAPSHOT_TTL_SECONDS * 1000;
const MAX_TASK_ATTEMPTS = 3;
const TASK_BACKOFF_MS = 1000 * 60;
const DEDUPE_WINDOW_MS = 1000 * 30;

const recordMetric = (name: string, value: number) => {
  console.info(`[metric] ${name}`, value);
};

type ResultWithRelations = Prisma.ResultGetPayload<{
  include: {
    exam: {
      include: {
        lesson: {
          include: {
            subject: true;
          };
        };
      };
    };
    assignment: {
      include: {
        lesson: {
          include: {
            subject: true;
          };
        };
      };
    };
  };
}>;

const mapPrismaResultToRecord = (result: ResultWithRelations): ResultRecord => ({
  score: result.score,
  exam: result.exam
    ? {
        title: result.exam.title,
        startTime: result.exam.startTime,
        lesson: {
          subject: result.exam.lesson?.subject ?? null,
        },
      }
    : undefined,
  assignment: result.assignment
    ? {
        title: result.assignment.title,
        dueDate: result.assignment.dueDate,
        lesson: {
          subject: result.assignment.lesson?.subject ?? null,
        },
      }
    : undefined,
});

const toSnapshotRow = (metrics: StudentPerformanceSnapshot) => ({
  overallScore: metrics.overallScore,
  growthRate: metrics.growthRate,
  attendanceRate: metrics.attendanceRate,
  assignmentsCompleted: metrics.assignments.completed,
  assignmentsTotal: metrics.assignments.total,
  readingMinutes: metrics.readingMinutes,
  mathFluency: metrics.mathFluency,
  subjectMetrics: metrics.subjectMetrics,
  assessments: metrics.assessments,
});

export type ClassroomSnapshotEntry = {
  studentId: string;
  guardianEmail: string | null;
  metrics: StudentPerformanceSnapshot;
  snapshotAgeSeconds: number;
  refreshStatus: SnapshotStatus;
  warning?: string;
  updatedAt: Date;
};

export type StudentPerformanceSnapshotWithMeta = {
  metrics: StudentPerformanceSnapshot;
  snapshotAgeSeconds: number;
  refreshStatus: SnapshotStatus;
  warning?: string;
};

const computeSnapshotAgeSeconds = (updatedAt: Date) =>
  Math.max(0, Math.round((Date.now() - updatedAt.getTime()) / 1000));

const buildWarning = (
  ageSeconds: number,
  status: SnapshotStatus
): string | undefined => {
  if (status !== SnapshotStatus.READY) {
    return "Metrics are being refreshed — please wait a moment.";
  }
  if (ageSeconds > SNAPSHOT_TTL_SECONDS) {
    return "Metrics may be slightly delayed.";
  }
  return undefined;
};

const buildEntry = (
  row: Prisma.PerformanceSnapshotGetPayload<{
    include: {
      student: {
        select: {
          guardianEmail: true;
        };
      };
    };
  }>
): ClassroomSnapshotEntry => {
  const age = computeSnapshotAgeSeconds(row.updatedAt);
  return {
    studentId: row.studentId,
    guardianEmail: row.student.guardianEmail ?? null,
    metrics: {
      overallScore: row.overallScore,
      growthRate: row.growthRate,
      attendanceRate: row.attendanceRate,
      assignments: {
        completed: row.assignmentsCompleted,
        total: row.assignmentsTotal,
      },
      readingMinutes: row.readingMinutes,
      mathFluency: row.mathFluency,
      subjectMetrics: row.subjectMetrics as StudentPerformanceSnapshot["subjectMetrics"],
      assessments: row.assessments as StudentPerformanceSnapshot["assessments"],
    },
    snapshotAgeSeconds: age,
    refreshStatus: row.refreshStatus,
    warning: buildWarning(age, row.refreshStatus),
    updatedAt: row.updatedAt,
  };
};

export const refreshSnapshotsForClass = async (
  classId: number
): Promise<ClassroomSnapshotEntry[]> => {
  const startTime = Date.now();
  const classroom = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        select: {
          id: true,
          guardianEmail: true,
          results: {
            include: {
              exam: {
                include: {
                  lesson: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
              assignment: {
                include: {
                  lesson: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
          attendances: {
            select: {
              present: true,
            },
          },
        },
      },
    },
  });

  if (!classroom || classroom.students.length === 0) {
    return [];
  }

  const assignmentTotal = await prisma.assignment.count({
    where: {
      lesson: {
        classId,
      },
    },
  });

  const classResults = classroom.students.flatMap((student) =>
    student.results.map(mapPrismaResultToRecord)
  );

  const entries: ClassroomSnapshotEntry[] = [];
  const updatedAt = new Date();

  for (const student of classroom.students) {
    const studentResults = student.results.map(mapPrismaResultToRecord);
    const metrics = buildSnapshotFromRecords({
      studentResults,
      classResults,
      attendanceRecords: student.attendances,
      assignmentTotal,
    });

    await prisma.performanceSnapshot.upsert({
      where: { studentId: student.id },
      update: {
        ...toSnapshotRow(metrics),
        version: { increment: 1 },
        refreshStatus: SnapshotStatus.READY,
        refreshLog: null,
      },
      create: {
        id: `snapshot-${student.id}`,
        studentId: student.id,
        ...toSnapshotRow(metrics),
        version: 1,
        refreshStatus: SnapshotStatus.READY,
        refreshLog: null,
      },
    });

    entries.push({
      studentId: student.id,
      guardianEmail: student.guardianEmail ?? null,
      metrics,
      snapshotAgeSeconds: 0,
      refreshStatus: SnapshotStatus.READY,
      warning: undefined,
      updatedAt,
    });
  }

  recordMetric("snapshot_refresh_duration_ms", Date.now() - startTime);
  return entries;
};

export const refreshStudentSnapshot = async (
  studentId: string
): Promise<StudentPerformanceSnapshot> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student?.classId) {
    throw new Error("Unable to refresh snapshot without class context");
  }

  const snapshots = await refreshSnapshotsForClass(student.classId);
  const snapshot = snapshots.find((entry) => entry.studentId === studentId);
  if (!snapshot) {
    throw new Error("Snapshot refresh failed to produce data");
  }

  return snapshot.metrics;
};

export const enqueueSnapshotRefresh = async (studentId: string) => {
  const existing = await prisma.snapshotRefreshTask.findUnique({
    where: { studentId },
  });

  if (existing) {
    const tooFresh = Date.now() - existing.scheduledAt.getTime() < DEDUPE_WINDOW_MS;
    const alreadyInFlight =
      existing.status === SnapshotTaskStatus.PENDING ||
      existing.status === SnapshotTaskStatus.PROCESSING;
    if (alreadyInFlight && tooFresh) {
      return;
    }
    await prisma.snapshotRefreshTask.update({
      where: { studentId },
      data: {
        status: SnapshotTaskStatus.PENDING,
        scheduledAt: new Date(),
        lastError: null,
      },
    });
    return;
  }

  await prisma.snapshotRefreshTask.create({
    data: {
      studentId,
    },
  });
};

export const getSnapshotQueueDepth = () =>
  prisma.snapshotRefreshTask.count({
    where: { status: SnapshotTaskStatus.PENDING },
  });

export const processSnapshotQueue = async (limit = 5) => {
  const startTime = Date.now();
  const pending = await prisma.snapshotRefreshTask.findMany({
    where: {
      status: SnapshotTaskStatus.PENDING,
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  const queueDepth = await getSnapshotQueueDepth();
  recordMetric("snapshot_refresh_queue_depth", queueDepth);

  let processed = 0;
  let errorCount = 0;

  for (const task of pending) {
    let locked: Prisma.SnapshotRefreshTaskGetPayload<{
      include: {};
    }> | null = null;
    try {
      locked = await prisma.snapshotRefreshTask.update({
        where: {
          id: task.id,
          status: SnapshotTaskStatus.PENDING,
        },
        data: {
          status: SnapshotTaskStatus.PROCESSING,
          lockedAt: new Date(),
        },
        select: {
          id: true,
          studentId: true,
          status: true,
          attempts: true,
        },
      });
    } catch {
      continue;
    }

    try {
      const student = await prisma.student.findUnique({
        where: { id: locked.studentId },
        select: { classId: true },
      });
      if (!student?.classId) {
        throw new Error("Student missing class assignment");
      }

      await refreshSnapshotsForClass(student.classId);

      await prisma.snapshotRefreshTask.update({
        where: { id: locked.id },
        data: {
          status: SnapshotTaskStatus.DONE,
          attempts: locked.attempts + 1,
          lastError: null,
        },
      });

      processed += 1;
    } catch (error) {
      errorCount += 1;
      const attempts = locked.attempts + 1;
      const nextStatus =
        attempts >= MAX_TASK_ATTEMPTS
          ? SnapshotTaskStatus.FAILED
          : SnapshotTaskStatus.PENDING;
      await prisma.snapshotRefreshTask.update({
        where: { id: locked.id },
        data: {
          status: nextStatus,
          attempts,
          lastError:
            error instanceof Error ? error.message : "Unknown error",
          scheduledAt:
            nextStatus === SnapshotTaskStatus.PENDING
              ? new Date(Date.now() + TASK_BACKOFF_MS * attempts)
              : locked.scheduledAt,
        },
      });

      recordMetric("snapshot_refresh_error_rate", 1);
      console.error("[snapshotQueue] refresh error", { studentId: locked.studentId, error });
    }
  }

  recordMetric("snapshot_refresh_duration_ms", Date.now() - startTime);
  if (errorCount > 0) {
    recordMetric("snapshot_refresh_error_rate", errorCount);
  }

  return { processed, errorCount };
};

const hydrateClassroomSnapshotEntries = async (
  studentIds: string[]
): Promise<ClassroomSnapshotEntry[]> => {
  const rows = await prisma.performanceSnapshot.findMany({
    where: {
      studentId: { in: studentIds },
    },
    include: {
      student: {
        select: {
          guardianEmail: true,
        },
      },
    },
  });

  return rows.map(buildEntry);
};

export const ensureClassroomSnapshots = async (
  classId: number,
  options?: { forceRefresh?: boolean }
): Promise<ClassroomSnapshotEntry[]> => {
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  if (students.length === 0) {
    return [];
  }

  if (options?.forceRefresh) {
    await refreshSnapshotsForClass(classId);
  }

  let entries = await hydrateClassroomSnapshotEntries(
    students.map((student) => student.id)
  );

  if (entries.length === 0 && !options?.forceRefresh) {
    return ensureClassroomSnapshots(classId, { forceRefresh: true });
  }

  const staleEntries = entries.filter(
    (entry) =>
      entry.snapshotAgeSeconds > SNAPSHOT_TTL_SECONDS ||
      entry.refreshStatus !== SnapshotStatus.READY
  );

  if (staleEntries.length > 0) {
    for (const entry of staleEntries) {
      enqueueSnapshotRefresh(entry.studentId);
    }
  }

  return entries;
};

export const getStudentPerformanceSnapshot = async (
  studentId: string
): Promise<StudentPerformanceSnapshotWithMeta> => {
  const row = await prisma.performanceSnapshot.findUnique({
    where: { studentId },
  });

  if (!row) {
    await enqueueSnapshotRefresh(studentId);
    const metrics = await refreshStudentSnapshot(studentId);
    return {
      metrics,
      snapshotAgeSeconds: 0,
      refreshStatus: SnapshotStatus.READY,
    };
  }

  const age = computeSnapshotAgeSeconds(row.updatedAt);
  recordMetric("snapshot_age_seconds", age);
  if (age > SNAPSHOT_TTL_SECONDS) {
    enqueueSnapshotRefresh(studentId);
  }

  return {
    metrics: {
      overallScore: row.overallScore,
      growthRate: row.growthRate,
      attendanceRate: row.attendanceRate,
      assignments: {
        completed: row.assignmentsCompleted,
        total: row.assignmentsTotal,
      },
      readingMinutes: row.readingMinutes,
      mathFluency: row.mathFluency,
      subjectMetrics: row.subjectMetrics as StudentPerformanceSnapshot["subjectMetrics"],
      assessments: row.assessments as StudentPerformanceSnapshot["assessments"],
    },
    snapshotAgeSeconds: age,
    refreshStatus: row.refreshStatus,
    warning: buildWarning(age, row.refreshStatus),
  };
};

let snapshotTriggersRegistered = false;

const registerPrismaTriggers = () => {
  if (snapshotTriggersRegistered) {
    return;
  }

  if (typeof prisma.$use !== "function") {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[snapshotService] prisma.$use is not available – skipping triggers");
    }
    return;
  }

  snapshotTriggersRegistered = true;

  prisma.$use(async (params, next) => {
    const result = await next(params);

    const shouldTrigger =
      params.model === "Result" ||
      params.model === "Attendance" ||
      params.model === "Assignment";
    const actionable =
      params.action === "create" ||
      params.action === "update" ||
      params.action === "delete";

    if (!shouldTrigger || !actionable) {
      return result;
    }

    const queueStudentId = (candidate?: string | null) => {
      if (!candidate) {
        return;
      }
      enqueueSnapshotRefresh(candidate).catch((error) => {
        console.error("[snapshotTriggers] enqueue failed", { error, candidate });
      });
    };

    if (params.model === "Assignment") {
      const lessonId =
        (params.args?.data as { lessonId?: number })?.lessonId ??
        (params.args?.where as { lessonId?: number })?.lessonId;
      if (lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
          select: { classId: true },
        });
        if (lesson?.classId) {
          const students = await prisma.student.findMany({
            where: { classId: lesson.classId },
            select: { id: true },
          });
          students.forEach((student) => queueStudentId(student.id));
        }
      }
      return result;
    }

    if (Array.isArray(result)) {
      result.forEach((item) => queueStudentId((item as { studentId?: string }).studentId));
      return result;
    }

    queueStudentId((result as { studentId?: string }).studentId);
    return result;
  });
};

registerPrismaTriggers();
