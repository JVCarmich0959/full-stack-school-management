"use client";

import { Suspense } from "react";

import MetricCard from "@/components/student/MetricCard";
import SubjectRadarChart from "@/components/student/SubjectRadarChart";
import { useStudentMetrics } from "@/lib/hooks/useStudentMetrics";

const LoadingState = () => (
  <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-6 text-sm text-[color:var(--color-text-muted)]">
    Loading performance data...
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-3xl border border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
    {message}
  </div>
);

const PerformanceDashboardContent = ({ studentId }: { studentId: string }) => {
  const { data, error, isLoading } = useStudentMetrics(studentId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  if (!data) {
    return <EmptyState message="No performance data found." />;
  }

  const assignmentRate = Math.round(
    (data.assignmentsCompleted / data.assignmentsTotal) * 100
  );

  return (
    <div className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Performance dashboard
          </p>
          <h2 className="text-2xl font-semibold">Scholar progress</h2>
        </div>
        <MetricCard
          label="Mastery"
          value={`${data.overallScore}%`}
          helper="Rolling average"
          tone="success"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Growth percentile" value={`${data.growthRate}`} />
        <MetricCard label="Attendance" value={`${data.attendanceRate}%`} />
        <MetricCard
          label="Assignments"
          value={`${data.assignmentsCompleted}/${data.assignmentsTotal}`}
          helper={`${assignmentRate}% on-time`}
        />
        <MetricCard
          label="Math fluency"
          value={`${data.mathFluency}%`}
          helper="Sprint benchmark"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">
          Subject benchmarks (student vs class)
        </p>
        <div className="space-y-2">
          {data.subjects.map((subject) => (
            <div
              key={subject.name}
              className="rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between font-semibold">
                <span>{subject.name}</span>
                <span>{subject.studentScore}%</span>
              </div>
              <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                Class avg: {subject.classAverage}%
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--color-border)]/40">
                <div
                  className="h-full rounded-full bg-[var(--color-accent-primary)]"
                  style={{ width: `${subject.studentScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubjectRadarChart
        scores={{
          math: data.subjects.find((s) => s.name.toLowerCase().includes("math"))?.studentScore,
          ela: data.subjects.find((s) => s.name.toLowerCase().includes("ela"))?.studentScore,
          science: data.subjects.find((s) => s.name.toLowerCase().includes("science"))?.studentScore,
        }}
      />

      <div>
        <p className="text-xs font-semibold text-[color:var(--color-text-muted)]">
          Recent assessments
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {data.assessments.map((assessment) => (
            <MetricCard
              key={assessment.name}
              label={assessment.name}
              value={`${assessment.score}%`}
              helper={assessment.dateLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const PerformanceDashboard = ({ studentId }: { studentId: string }) => (
  <Suspense fallback={<LoadingState />}>
    <PerformanceDashboardContent studentId={studentId} />
  </Suspense>
);

export default PerformanceDashboard;
