"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { toast } from "react-toastify";

import MetricCard from "@/components/student/MetricCard";
import { useClassroomMetrics } from "@/lib/hooks/useClassroomMetrics";
import { normalizeScores } from "@/lib/utils/scoreNormalization";

const LazyRadarChart = dynamic(
  () => import("@/components/student/SubjectRadarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-dashed border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
        Loading radar...
      </div>
    ),
  }
);

type TeacherDashboardProps = {
  teacherId: string;
};

const TeacherDashboard = ({ teacherId }: TeacherDashboardProps) => {
  useEffect(() => {
    console.debug("[TeacherDashboard] mounted", { teacherId });
  }, [teacherId]);

  const { data, error, isLoading } = useClassroomMetrics({ teacherId });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
        Loading classroom performance...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
        No performance data available.
      </div>
    );
  }

  const radarScores = normalizeScores({
    math: data.subjectAverages?.math,
    ela: data.subjectAverages?.ela,
    science: data.subjectAverages?.science,
  });

  return (
    <div className="space-y-4 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Teacher dashboard
          </p>
          <h2 className="text-2xl font-semibold">Homeroom overview</h2>
        </div>
        <MetricCard
          label="Avg attendance"
          value={`${data.averageAttendance}%`}
          helper="Classroom"
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

      <LazyRadarChart scores={radarScores} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Data quality
          </p>
          <p className="text-base font-semibold">
            {data.dataQuality?.missingContacts ?? 0} guardians missing contact info
          </p>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Encourage families to update details
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
            Assessment coverage
          </p>
          <p className="text-base font-semibold">
            {data.dataQuality?.lowAssessmentCoverage ?? 0} students missing benchmarks
          </p>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Schedule make-ups for full insight
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
