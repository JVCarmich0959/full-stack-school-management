import prisma from "@/lib/prisma";
import { calculateAverage, calculateSubjectAverages } from "@/lib/metrics";
import { getStudentPerformanceSnapshot } from "@/lib/performance";
import type { ClassroomMetrics } from "@/types/metrics";

export const buildTeacherClassroomMetrics = async (
  teacherId: string
): Promise<ClassroomMetrics> => {
  const classroom = await prisma.class.findFirst({
    where: { supervisorId: teacherId },
    include: { students: true },
  });

  if (!classroom || classroom.students.length === 0) {
    return {
      masteryDistribution: [],
      averageAttendance: 0,
      topSubjects: [],
      subjectAverages: { math: 0, ela: 0, science: 0 },
      dataQuality: {
        missingContacts: 0,
        lowAssessmentCoverage: 0,
      },
    };
  }

  const snapshots = classroom.students.map((student) => ({
    id: student.id,
    guardianEmail: student.guardianEmail,
    metrics: getStudentPerformanceSnapshot(student.id),
  }));

  const averages = calculateSubjectAverages(
    snapshots.flatMap((snapshot) => snapshot.metrics.subjectMetrics)
  );

  const totalStudents = snapshots.length || 1;
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

  const masteryDistribution = [
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

  return {
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
  };
};
