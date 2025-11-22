"use client";

import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
  children: ReactNode;
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export default function Card({
  className,
  padding = "md",
  interactive = false,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm transition-shadow duration-200",
        interactive && "focus-within:ring-2 focus-within:ring-[var(--color-accent-secondary)] hover:shadow-lg/40",
        paddingMap[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
