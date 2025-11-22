"use client";

import { useEffect } from "react";
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  normalizeScores,
  SubjectScores,
} from "@/lib/utils/scoreNormalization";

type SubjectRadarChartProps = {
  scores: SubjectScores;
};

const SubjectRadarChart = ({ scores }: SubjectRadarChartProps) => {
  useEffect(() => {
    console.debug("[SubjectRadarChart] mounted");
    return () => console.debug("[SubjectRadarChart] unmounted");
  }, []);

  const sanitized = normalizeScores(scores);
  const chartData = [
    { subject: "Math", value: sanitized.math },
    { subject: "ELA", value: sanitized.ela },
    { subject: "Science", value: sanitized.science },
  ];

  const hasData = chartData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] px-4 py-6 text-sm text-[color:var(--color-text-muted)]">
        No subject performance data available.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            Subject profile
          </p>
          <h3 className="text-lg font-semibold">Math • ELA • Science</h3>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis domain={[0, 100]} tick={false} />
            <Tooltip />
            <Radar
              dataKey="value"
              stroke="#c0a95e"
              fill="#c0a95e"
              fillOpacity={0.4}
              animationDuration={1200}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* TODO: Integrate longitudinal growth over time with radar overlay */}
    </div>
  );
};

export default SubjectRadarChart;
