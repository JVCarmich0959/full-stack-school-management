"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/70 px-6 py-12 text-center text-sm text-[color:var(--color-text-muted)]",
        className
      )}
    >
      <p className="text-base font-semibold text-[color:var(--color-text-primary)]">{title}</p>
      {description && <p className="max-w-md text-xs">{description}</p>}
      {action}
    </div>
  );
}
