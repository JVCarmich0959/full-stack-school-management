import type { SnapshotStatus } from "@prisma/client";

export type FreshnessMeta = {
  policyVersion: number;
  staleThresholdSeconds: number;
  snapshotAgeSeconds: number;
  refreshStatus?: SnapshotStatus;
  queueDepth?: number;
  warnings?: string[];
  refreshError?: string;
};

export type ApiResponse<T> = {
  data: T;
  meta: FreshnessMeta;
};
