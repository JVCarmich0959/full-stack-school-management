"use client";

import { useEffect, useState } from "react";

import type { ClassroomMetrics } from "@/types/metrics";

type HookState = {
  data?: ClassroomMetrics;
  error?: string;
  isLoading: boolean;
};

type ClassroomMetricOptions = {
  studentId?: string;
  teacherId?: string;
};

/**
 * Aggregates classroom-level performance metrics.
 * @param options - Identifier for the target class (student or teacher context).
 */
export const useClassroomMetrics = (
  options: ClassroomMetricOptions
): HookState => {
  const [state, setState] = useState<HookState>({ isLoading: true });
  const { studentId, teacherId } = options;

  useEffect(() => {
    let mounted = true;

    const params = new URLSearchParams();
    if (studentId) params.set("studentId", studentId);
    if (teacherId) params.set("teacherId", teacherId);

    fetch(`/api/metrics/classroom?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to load classroom metrics");
        }
        return res.json();
      })
      .then((data: ClassroomMetrics) => {
        if (mounted) {
          setState({ data, isLoading: false });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({
            error:
              error instanceof Error ? error.message : "Unable to load classroom metrics",
            isLoading: false,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [studentId, teacherId]);

  return state;
};
