import { NextResponse } from "next/server";

import { buildTeacherClassroomMetrics } from "@/lib/services/classroomMetrics.server";
import { buildStudentClassroomMetrics } from "@/lib/services/metricsService";
import { getSnapshotQueueDepth } from "@/lib/performance";
import { SnapshotPolicy, SnapshotPolicyVersion } from "@/lib/freshnessPolicy";
import type { ApiResponse, FreshnessMeta } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId") || undefined;
  const teacherId = searchParams.get("teacherId") || undefined;

  try {
    if (teacherId) {
      const { metrics, meta } = await buildTeacherClassroomMetrics(teacherId);
      const payload: ApiResponse<typeof metrics> = {
        data: metrics,
        meta: {
          policyVersion: SnapshotPolicyVersion,
          staleThresholdSeconds: SnapshotPolicy.staleThresholdSeconds,
          snapshotAgeSeconds: meta.maxSnapshotAgeSeconds,
          refreshStatus: meta.refreshStatus,
          warnings: meta.warnings,
          queueDepth: meta.queueDepth,
        },
      };
      return NextResponse.json(payload);
    }
    if (studentId) {
      const { metrics, meta } = await buildStudentClassroomMetrics(studentId);
      const queueDepth = await getSnapshotQueueDepth();
      const payload: ApiResponse<typeof metrics> = {
        data: metrics,
        meta: {
          policyVersion: SnapshotPolicyVersion,
          staleThresholdSeconds: SnapshotPolicy.staleThresholdSeconds,
          snapshotAgeSeconds: meta.snapshotAgeSeconds,
          refreshStatus: meta.refreshStatus,
          warnings: meta.warning ? [meta.warning] : undefined,
          queueDepth,
        },
      };
      return NextResponse.json(payload);
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
