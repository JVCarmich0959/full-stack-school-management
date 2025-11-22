"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  align?: "start" | "center";
};

export default function PageHeader({
  title,
  subtitle,
  actions,
  className,
  align = "start",
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/60 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className={clsx("flex-1", align === "center" && "text-center sm:text-left")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
          Overview
        </p>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)]">{title}</h1>
        {subtitle && <p className="text-[13px] text-[color:var(--color-text-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>}
    </div>
  );
}
