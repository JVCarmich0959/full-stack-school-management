"use client";

import { useEffect, useMemo, useState } from "react";

import type { FreshnessMeta } from "@/types/api";
import type { SnapshotStatus } from "@prisma/client";

const statusStyles: Record<string, string> = {
  Live: "bg-green-100 text-green-700",
  Updating: "bg-amber-100 text-amber-800",
  Stale: "bg-yellow-100 text-yellow-800",
  Error: "bg-red-100 text-red-800",
};

const formatSnapshotAge = (seconds?: number) => {
  if (seconds === undefined) return "Snapshot age unknown";
  if (seconds < 60) {
    return `Updated ${Math.round(seconds)}s ago`;
  }
  const minutes = Math.round(seconds / 60);
  return `Updated ${minutes}m ago`;
};

type Props = {
  meta?: FreshnessMeta;
  error?: string;
  storageKey: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
};

const FreshnessBanner = ({
  meta,
  error,
  storageKey,
  onRefresh,
  isRefreshing,
}: Props) => {
  const [dismissedUntil, setDismissedUntil] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = window.localStorage.getItem(storageKey);
    return stored ? Number(stored) : 0;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(storageKey);
    setDismissedUntil(stored ? Number(stored) : 0);
  }, [storageKey]);

  const refreshFailing = meta?.refreshStatus === SnapshotStatus.FAILED;

  const status = useMemo(() => {
    if (error) return "Error";
    if (meta?.refreshStatus && meta.refreshStatus !== SnapshotStatus.READY) {
      return "Updating";
    }
    if (
      meta?.snapshotAgeSeconds !== undefined &&
      meta.staleThresholdSeconds !== undefined &&
      meta.snapshotAgeSeconds > meta.staleThresholdSeconds
    ) {
      return "Stale";
    }
    return "Live";
  }, [meta, error]);

  const isDismissed =
    dismissedUntil > Date.now() && status !== "Error" && status !== "Live";

  const handleDismiss = () => {
    if (typeof window === "undefined") return;
    const expires = Date.now() + 10 * 60 * 1000;
    window.localStorage.setItem(storageKey, expires.toString());
    setDismissedUntil(expires);
  };

  const handleRefresh = async () => {
    if (!onRefresh) {
      return;
    }
    try {
      await onRefresh();
    } catch {
      // ignore; mutation will surface error elsewhere
    }
  };

  if (isDismissed) {
    return null;
  }

  const description = error
    ? error
    : refreshFailing
    ? "Refresh failing—contact admin for assistance."
    : status === "Updating"
    ? "Metrics are being refreshed for accuracy—updates arrive shortly."
    : status === "Stale"
    ? "Last known good shown. Refresh queued."
    : "Live data.";

  return (
    <div
      role="status"
      className="flex flex-wrap items-start gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm shadow-sm"
    >
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.3em] ${statusStyles[status]}`}
      >
        {status}
      </span>
      <div className="flex-1 space-y-1 leading-snug text-[13px]">
        <p className="font-semibold text-[color:var(--color-text-primary)]">
          {description}
        </p>
        <p className="text-[11px] text-[color:var(--color-text-muted)]">
          {formatSnapshotAge(meta?.snapshotAgeSeconds)}{" "}
          {meta?.staleThresholdSeconds && `• TTL ${meta.staleThresholdSeconds}s`}
        </p>
        {meta?.warnings?.length ? (
          <p className="text-[12px] text-yellow-700">
            {meta.warnings.join(" ")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-[11px] text-[color:var(--color-text-muted)]">
          {typeof meta?.queueDepth === "number" ? (
            <span>Queue depth: {meta.queueDepth}</span>
          ) : null}
          {meta?.policyVersion ? <span>Policy v{meta.policyVersion}</span> : null}
        </div>
        {refreshFailing ? (
          <a
            href="/admin"
            className="text-xs font-semibold text-[color:var(--color-accent-primary)]"
          >
            View diagnostics
          </a>
        ) : null}
      </div>
      <div className="flex gap-2">
        {onRefresh ? (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-primary)] transition hover:border-[var(--color-accent-primary)] disabled:cursor-wait disabled:opacity-70"
          >
            {isRefreshing ? "Syncing…" : "Refresh now"}
          </button>
        ) : null}
        {status !== "Live" && status !== "Error" ? (
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-full border border-dashed border-[var(--color-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]"
          >
            Dismiss 10m
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FreshnessBanner;
