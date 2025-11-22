"use client";

import { useEffect, useState } from "react";

import { fetchStudentMetrics } from "@/lib/services/metricsService";
import type { StudentMetrics } from "@/types/metrics";

type HookState = {
  data?: StudentMetrics;
  error?: string;
  isLoading: boolean;
};

/**
 * Provides student performance metrics for dashboards.
 * @param studentId - Unique identifier for the student profile.
 */
export const useStudentMetrics = (studentId: string): HookState => {
  const [state, setState] = useState<HookState>({ isLoading: true });

  useEffect(() => {
    let mounted = true;

    fetchStudentMetrics(studentId)
      .then((data) => {
        if (mounted) {
          setState({ data, isLoading: false });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({
            error: error instanceof Error ? error.message : "Unable to load metrics",
            isLoading: false,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  return state;
};
