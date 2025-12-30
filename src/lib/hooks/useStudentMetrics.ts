"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SnapshotPolicy } from "@/lib/freshnessPolicy";
import {
  fetchStudentPerformanceMetrics,
  requestSnapshotRefresh,
} from "@/lib/api/classroomMetrics";
import type { ApiResponse, FreshnessMeta } from "@/types/api";
import type { StudentMetrics } from "@/types/metrics";

type HookState = {
  data?: StudentMetrics;
  meta?: FreshnessMeta;
  error?: string;
  isLoading: boolean;
  isRefetching: boolean;
  isRefreshing: boolean;
  refreshNow?: () => Promise<void>;
};

export const useStudentMetrics = (studentId: string): HookState => {
  const queryClient = useQueryClient();
  const queryKey = ["studentMetrics", studentId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchStudentPerformanceMetrics(studentId),
    staleTime: SnapshotPolicy.staleThresholdSeconds * 1000,
    cacheTime: SnapshotPolicy.staleThresholdSeconds * 2 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
    refetchInterval: (data) => {
      const meta = data?.meta;
      if (!meta) {
        return 60 * 1000;
      }
      if (meta.refreshStatus && meta.refreshStatus !== "READY") {
        return 5 * 1000;
      }
      if (
        meta.snapshotAgeSeconds > SnapshotPolicy.staleThresholdSeconds &&
        meta.snapshotAgeSeconds !== undefined
      ) {
        return 10 * 1000;
      }
      return 60 * 1000;
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => requestSnapshotRefresh(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
      ? "Unable to load metrics"
      : undefined;

  return {
    data: query.data?.data,
    meta: query.data?.meta,
    error,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isRefreshing: refreshMutation.isLoading,
    refreshNow: () => refreshMutation.mutateAsync(),
  };
};
