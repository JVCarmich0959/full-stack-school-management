"use client";

import clsx from "clsx";

import type { StudentPerformanceSnapshot } from "@/lib/performance";

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
    <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
      {label}
    </p>
    <p className="text-xl font-semibold text-[color:var(--color-text-primary)]">
      {value}
    </p>
    {helper && (
      <p className="text-xs text-[color:var(--color-text-muted)]">{helper}</p>
    )}
  </div>
);

const ProgressBar = ({
  value,
  color,
}: {
  value: number;
  color?: string;
}) => (
  <div className="h-2 w-full rounded-full bg-[var(--color-border)]/40">
    <div
      className={clsx("h-full rounded-full transition-all", color)}
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

const StudentPerformanceOverview = ({
  snapshot,
}: {
  snapshot: StudentPerformanceSnapshot;
}) => {
  const { assignments } = snapshot;
  const assignmentsPct = Math.round(
    (assignments.completed / assignments.total) * 100
  );

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 text-sm text-[color:var(--color-text-primary)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Performance snapshot
          </p>
          <h2 className="text-2xl font-semibold">Learning Pulse</h2>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold">{snapshot.overallScore}%</p>
          <p className="text-xs text-[color:var(--color-text-muted)]">
            Overall mastery
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-[color:var(--color-text-muted)]">
            Growth rate YoY
          </p>
          <ProgressBar value={(snapshot.growthRate / 20) * 100} color="bg-[#c0a95e]" />
          <p className="text-sm font-semibold">{snapshot.growthRate} percentile</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[color:var(--color-text-muted)]">
            Attendance
          </p>
          <ProgressBar value={snapshot.attendanceRate} color="bg-[#271b70]" />
          <p className="text-sm font-semibold">{snapshot.attendanceRate}% present</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Assignments"
          value={`${assignments.completed}/${assignments.total}`}
          helper={`${assignmentsPct}% completion`}
        />
        <StatCard
          label="Reading minutes"
          value={`${snapshot.readingMinutes}`}
          helper="This month"
        />
        <StatCard
          label="Math fluency"
          value={`${snapshot.mathFluency}%`}
          helper="Last benchmark"
        />
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Subject benchmarks
        </p>
        <div className="mt-2 space-y-2 text-xs">
          {snapshot.subjectMetrics.map((subject) => (
            <div
              key={subject.name}
              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] px-3 py-2"
            >
              <div className="min-w-[90px] font-semibold">{subject.name}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)]">
                  <span>Student</span>
                  <span>{subject.studentScore}%</span>
                </div>
                <ProgressBar value={subject.studentScore} color="bg-[#c0a95e]" />
                <div className="mt-1 flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)]">
                  <span>Class avg</span>
                  <span>{subject.classAverage}%</span>
                </div>
                <ProgressBar
                  value={subject.classAverage}
                  color="bg-[var(--color-text-muted)]/40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Recent assessments
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {snapshot.assessments.map((assessment) => (
            <div
              key={assessment.name}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2"
            >
              <p className="text-xs font-semibold">{assessment.name}</p>
              <p className="text-lg font-bold">{assessment.score}%</p>
              <p className="text-[11px] text-[color:var(--color-text-muted)]">
                {assessment.dateLabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceOverview;
