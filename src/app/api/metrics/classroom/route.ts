import { NextResponse } from "next/server";

import { buildTeacherClassroomMetrics } from "@/lib/services/classroomMetrics.server";
import { buildStudentClassroomMetrics } from "@/lib/services/metricsService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId") || undefined;
  const teacherId = searchParams.get("teacherId") || undefined;

  try {
    if (teacherId) {
      const metrics = await buildTeacherClassroomMetrics(teacherId);
      return NextResponse.json(metrics);
    }
    if (studentId) {
      const metrics = buildStudentClassroomMetrics(studentId);
      return NextResponse.json(metrics);
    }
    return NextResponse.json(
      { error: "studentId or teacherId is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[api/metrics/classroom]", error);
    return NextResponse.json(
      { error: "Unable to load classroom metrics" },
      { status: 500 }
    );
  }
}
