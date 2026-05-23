import Link from "next/link";

import type { DashboardMetric } from "@/server/services/dashboardService";

type ReportingInsightsProps = {
  metrics: DashboardMetric[];
};

const colorMap: Record<string, string> = {
  engagement: "bg-plPurpleLight",
  attendance: "bg-plYellowLight",
  completion: "bg-plSkyLight",
};

const formatLastUpdated = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const TrendCard = ({ metric }: { metric: DashboardMetric }) => {
  const deltaLabel =
    metric.delta >= 0 ? `+${metric.delta}% vs prior window` : `${metric.delta}% vs prior window`;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {metric.title}
          </p>
          <h3 className="text-lg font-semibold text-gray-900">{metric.value}%</h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            metric.delta >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {deltaLabel}
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div
          className={`${colorMap[metric.id] ?? "bg-plSkyLight"} h-full transition-all duration-500`}
          style={{ width: `${Math.min(metric.value, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 flex flex-col gap-1">
        <span>Window: {metric.window}</span>
        <span>Updated {formatLastUpdated(metric.lastUpdated)}</span>
      </div>
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer font-semibold text-[color:var(--color-text-primary)]">
          How is this calculated?
        </summary>
        <p className="mt-1">Formula: {metric.formula}</p>
        <p className="mt-1">Source: {metric.source}</p>
      </details>
    </div>
  );
};

const CohortBreakdown = () => {
  const cohorts = [
    { label: "Kindergarten", growth: 2.4, pulse: "text-green-600" },
    { label: "Grade 1", growth: 1.8, pulse: "text-green-600" },
    { label: "Grade 2", growth: -0.6, pulse: "text-red-600" },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Cohort performance</h3>
        <span className="text-xs text-gray-500">Last 14 days</span>
      </div>
      <div className="flex flex-col gap-2">
        {cohorts.map((cohort) => (
          <div
            key={cohort.label}
            className="flex items-center justify-between text-sm border-b border-dashed last:border-0 py-2"
          >
            <span className="font-medium text-gray-800">{cohort.label}</span>
            <span className={`${cohort.pulse} font-semibold`}>
              {cohort.growth > 0 ? "▲" : "▼"} {Math.abs(cohort.growth)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportingInsights = ({ metrics }: ReportingInsightsProps) => {
  const narrativeEntries = metrics
  .filter((metric) => metric.value > 0)
  .map((metric) => {
    const deltaText =
      metric.delta === 0
        ? ""
        : metric.delta > 0
        ? ` up ${metric.delta}% vs the prior window`
        : ` down ${Math.abs(metric.delta)}% vs the prior window`;

    let text = `${metric.title} is ${metric.value}% for the ${metric.window}${deltaText}.`;
    if (metric.id === "attendance") {
      text = `Attendance stability sits at ${metric.value}% over the ${metric.window}${deltaText}.`;
    } else if (metric.id === "engagement") {
      text = `Engagement score is ${metric.value}% for the ${metric.window}${deltaText}.`;
    } else if (metric.id === "completion") {
      text = `Completion rate is ${metric.value}% month-to-date${deltaText}.`;
    }

    return {
      metric,
      text,
    };
  });

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-gray-500">Advanced reporting</p>
          <h2 className="text-xl font-semibold text-gray-900">Impact overview</h2>
        </div>
        <button
          type="button"
          className="text-xs px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50"
        >
          Download summary
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {metrics.map((metric) => (
          <TrendCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-4">
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Report narrative</h3>
            <span className="text-xs text-gray-500">Live draft</span>
          </div>
          <p className="text-xs text-gray-500">
            Draft text; verify before publishing.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-3">
            {narrativeEntries.map(({ text, metric }) => (
              <li key={metric.id}>
                <p>{text}</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Based on:{" "}
                  <Link
                    href={metric.link}
                    className="font-semibold text-[color:var(--color-accent-primary)]"
                  >
                    {metric.title} ({metric.window})
                  </Link>
                </p>
              </li>
            ))}
            {narrativeEntries.length === 0 && (
              <li className="text-[11px] text-gray-500">
                Metrics are still warming up; refresh once data is available.
              </li>
            )}
          </ul>
        </div>
        <CohortBreakdown />
      </div>
    </section>
  );
};

export default ReportingInsights;
