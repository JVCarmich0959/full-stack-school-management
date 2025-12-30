"use client";

import MetricCard from "@/components/student/MetricCard";
import FreshnessBanner from "@/components/FreshnessBanner";
import { useClassroomMetrics } from "@/lib/hooks/useClassroomMetrics";

const LoadingState = () => (
  <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-6 text-sm text-[color:var(--color-text-muted)]">
    Loading classroom metrics...
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-3xl border border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
    {message}
  </div>
);

const ClassroomMetrics = ({ studentId }: { studentId: string }) => {
  const {
    data,
    meta,
    error,
    isLoading,
    isRefetching,
    refreshNow,
    isRefreshing,
  } = useClassroomMetrics({ studentId });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  if (!data) {
    return <EmptyState message="No classroom metrics available." />;
  }

  return (
    <div className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <FreshnessBanner
        meta={meta}
        error={error}
        storageKey={`classroom-metrics-${studentId}`}
        onRefresh={refreshNow}
        isRefreshing={isRefreshing}
      />
      {isRefetching && (
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Revalidating classroom metrics…
        </p>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Classroom metrics
          </p>
          <h2 className="text-xl font-semibold">Homeroom pulse</h2>
        </div>
        <MetricCard
          label="Avg attendance"
          value={`${data.averageAttendance}%`}
          helper="Class view"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {data.masteryDistribution.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={`${metric.value}%`}
            helper={metric.helper}
          />
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">
          Top performing subjects
        </p>
        <div className="mt-2 space-y-2 text-sm">
          {data.topSubjects.map((subject) => (
            <div
              key={subject.name}
              className="rounded-2xl border border-[var(--color-border)] px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{subject.name}</span>
                <span>{subject.classAverage}% class avg</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassroomMetrics;
