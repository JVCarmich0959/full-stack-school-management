"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SnapshotPolicy } from "@/lib/freshnessPolicy";
import type { ClassroomMetrics } from "@/types/metrics";
import type { FreshnessMeta } from "@/types/api";
import {
  ClassroomMetricOptions,
  fetchClassroomMetrics,
  getClassroomMetricsQueryKey,
  requestSnapshotRefresh,
} from "@/lib/api/classroomMetrics";

type HookState = {
  data?: ClassroomMetrics;
  meta?: FreshnessMeta;
  error?: string;
  isLoading: boolean;
  isRefetching: boolean;
  refreshNow?: () => Promise<void>;
  isRefreshing: boolean;
};

export const useClassroomMetrics = (
  options: ClassroomMetricOptions
): HookState => {
  const queryClient = useQueryClient();
  const queryKey = getClassroomMetricsQueryKey(options);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchClassroomMetrics(options),
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
    enabled: Boolean(options.teacherId ?? options.studentId),
  });

  const refreshMutation = useMutation({
    mutationFn: () => {
      if (!options.studentId) {
        throw new Error("studentId is required for refresh");
      }
      return requestSnapshotRefresh(options.studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const error =
    query.error instanceof Error
      ? query.error.message
      : query.error
      ? "Unable to load classroom metrics"
      : undefined;

  return {
    data: query.data?.data,
    meta: query.data?.meta,
    error,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    refreshNow: options.studentId ? () => refreshMutation.mutateAsync() : undefined,
    isRefreshing: options.studentId ? refreshMutation.isLoading : false,
  };
};
