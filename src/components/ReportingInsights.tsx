"use client";

const trendData = [
  {
    title: "Engagement",
    description: "Average class engagement score across tracked subjects.",
    value: 82,
    delta: 6,
    color: "bg-plPurpleLight",
  },
  {
    title: "Wellbeing",
    description: "Percentage of students with perfect weekly attendance.",
    value: 71,
    delta: -3,
    color: "bg-plYellowLight",
  },
  {
    title: "Finance",
    description: "Tuition and fees collected against the monthly target.",
    value: 89,
    delta: 12,
    color: "bg-plSkyLight",
  },
];

const CohortBreakdown = () => {
  const cohorts = [
    { label: "Grade 8", growth: 4.2, pulse: "text-green-600" },
    { label: "Grade 9", growth: 2.1, pulse: "text-green-600" },
    { label: "Grade 10", growth: -1.3, pulse: "text-red-600" },
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

const TrendCard = ({
  title,
  description,
  value,
  delta,
  color,
}: (typeof trendData)[number]) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
        <h3 className="text-lg font-semibold text-gray-900">{value}%</h3>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${delta >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {delta >= 0 ? `+${delta}%` : `${delta}%`} vs last week
      </div>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
      <div
        className={`${color} h-full transition-all duration-500`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const ReportingInsights = () => {
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
        {trendData.map((trend) => (
          <TrendCard key={trend.title} {...trend} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-4">
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Report narrative</h3>
            <span className="text-xs text-gray-500">Live draft</span>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-2">
            <li>
              Attendance stability remains above the 95% target despite seasonal
              dips.
            </li>
            <li>
              Teacher-led interventions improved engagement by 6% week-over-week
              in STEM cohorts.
            </li>
            <li>
              Finance collections closed 89% of the target with two weeks
              remaining.
            </li>
          </ul>
        </div>
        <CohortBreakdown />
      </div>
    </section>
  );
};

export default ReportingInsights;
