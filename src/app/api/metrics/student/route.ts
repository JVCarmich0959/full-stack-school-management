import { NextResponse } from "next/server";

import { fetchStudentMetrics } from "@/lib/services/metricsService";
import { getSnapshotQueueDepth } from "@/lib/performance";
import { SnapshotPolicy, SnapshotPolicyVersion } from "@/lib/freshnessPolicy";
import type { ApiResponse } from "@/types/api";
import type { StudentMetrics } from "@/types/metrics";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  try {
    const metrics = await fetchStudentMetrics(studentId);
    const queueDepth = await getSnapshotQueueDepth();
    const payload: ApiResponse<StudentMetrics> = {
      data: metrics,
      meta: {
        policyVersion: SnapshotPolicyVersion,
        staleThresholdSeconds: SnapshotPolicy.staleThresholdSeconds,
        snapshotAgeSeconds: metrics.snapshot?.ageSeconds ?? 0,
        refreshStatus: metrics.snapshot?.refreshStatus,
        warnings: metrics.snapshot?.warning ? [metrics.snapshot.warning] : undefined,
        queueDepth,
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[api/metrics/student]", error);
    return NextResponse.json(
      { error: "Unable to load student metrics" },
      { status: 500 }
    );
  }
}
