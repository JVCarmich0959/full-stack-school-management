"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: "default" | "warning" | "success";
};

const toneStyles: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)]",
  warning: "border-amber-200/70 bg-amber-50 text-amber-900",
  success: "border-emerald-200/70 bg-emerald-50 text-emerald-900",
};

const MetricCard = ({ label, value, helper, tone = "default" }: MetricCardProps) => (
  <div className={clsx("rounded-2xl border px-4 py-3 text-sm", toneStyles[tone])}>
    <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
      {label}
    </p>
    <div className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
      {value}
    </div>
    {helper && <p className="text-xs text-[color:var(--color-text-muted)]">{helper}</p>}
  </div>
);

export default MetricCard;
