"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParentFiltersProps = {
  grades: number[];
  homerooms: string[];
  selectedGrade?: string;
  selectedHomeroom?: string;
  selectedGuardian?: string;
};

const ParentFilters = ({
  grades,
  homerooms,
  selectedGrade,
  selectedHomeroom,
  selectedGuardian,
}: ParentFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    startTransition(() => {
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  return (
    <div className="grid gap-3 text-xs text-[color:var(--color-text-muted)] sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex flex-col gap-1">
        <span className="font-semibold uppercase tracking-[0.2em]">Grade</span>
        <select
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[color:var(--color-text-primary)]"
          value={selectedGrade || "all"}
          onChange={(e) => updateParam("grade", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All grades</option>
          {grades.map((level) => (
            <option key={level} value={level}>
              {level === 0 ? "Kindergarten" : level === -1 ? "EC" : `Grade ${level}`}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold uppercase tracking-[0.2em]">Homeroom</span>
        <select
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[color:var(--color-text-primary)]"
          value={selectedHomeroom || "all"}
          onChange={(e) => updateParam("homeroom", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All homerooms</option>
          {homerooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold uppercase tracking-[0.2em]">Guardian info</span>
        <select
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[color:var(--color-text-primary)]"
          value={selectedGuardian || "all"}
          onChange={(e) => updateParam("guardian", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All households</option>
          <option value="complete">Email on file</option>
          <option value="missing">Missing email</option>
        </select>
      </label>
    </div>
  );
};

export default ParentFilters;
