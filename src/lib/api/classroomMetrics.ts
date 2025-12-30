import type { ApiResponse } from "@/types/api";
import type { ClassroomMetrics, StudentMetrics } from "@/types/metrics";

export type ClassroomMetricOptions = {
  studentId?: string;
  teacherId?: string;
};

export const getClassroomMetricsQueryKey = (options: ClassroomMetricOptions) => {
  const context = options.teacherId ? "teacher" : "student";
  const identifier = options.teacherId ?? options.studentId;
  if (!identifier) {
    throw new Error("teacherId or studentId is required for classroom metrics");
  }
  return ["classroomMetrics", context, identifier];
};

export const fetchClassroomMetrics = async (
  options: ClassroomMetricOptions
): Promise<ApiResponse<ClassroomMetrics>> => {
  const params = new URLSearchParams();
  if (options.studentId) {
    params.set("studentId", options.studentId);
  }
  if (options.teacherId) {
    params.set("teacherId", options.teacherId);
  }

  if (!params.has("studentId") && !params.has("teacherId")) {
    throw new Error("studentId or teacherId is required");
  }

  const res = await fetch(`/api/metrics/classroom?${params.toString()}`, {
    cache: "no-store",
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error ?? "Unable to load classroom metrics");
  }
  return payload;
};

export const fetchStudentPerformanceMetrics = async (
  studentId: string
): Promise<ApiResponse<StudentMetrics>> => {
  const params = new URLSearchParams({ studentId });
  const res = await fetch(`/api/metrics/student?${params.toString()}`, {
    cache: "no-store",
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error ?? "Unable to load student metrics");
  }
  return payload;
};

export const requestSnapshotRefresh = async (studentId: string) => {
  const res = await fetch(`/api/metrics/classroom/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
    cache: "no-store",
  });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error ?? "Unable to enqueue refresh");
  }
  return payload;
};
