"use client";

import { useRouter } from "next/navigation";

import {
  DirectoryGradeToken,
  GRADE_LABELS,
  GRADE_TOKENS,
} from "@/lib/studentDirectoryConfig";

type StudentFiltersProps = {
  grade: DirectoryGradeToken[];
  missingSubjects: boolean;
  missingClasses: boolean;
  multiGrade: boolean;
};

const buildUrlWithPatch = (patch: Record<string, string | undefined>) => {
  const params = new URLSearchParams(window.location.search);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  const nextSearch = params.toString();
  return `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
};

const StudentFilters = ({
  grade,
  missingSubjects,
  missingClasses,
  multiGrade,
}: StudentFiltersProps) => {
  const router = useRouter();

  const updateQuery = (patch: Record<string, string | undefined>) => {
    router.push(buildUrlWithPatch({ ...patch, page: "1" }));
  };

  const toggleGrade = (token: DirectoryGradeToken) => {
    const nextGrades = grade.includes(token)
      ? grade.filter((value) => value !== token)
      : [...grade, token];
    const value = nextGrades.length > 0 ? nextGrades.join(",") : undefined;
    updateQuery({ grade: value });
  };

  const toggleFlag = (key: "missingSubjects" | "missingClasses" | "multiGrade") => {
    const nextValue = (() => {
      const current = { missingSubjects, missingClasses, multiGrade }[key];
      return current ? undefined : "1";
    })();
    updateQuery({ [key]: nextValue });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--color-text-muted)]">
      <span className="font-semibold uppercase tracking-wide">Filters:</span>
      <div className="flex flex-wrap gap-1">
        {GRADE_TOKENS.map((token) => (
          <button
            key={token}
            type="button"
            aria-pressed={grade.includes(token)}
            title={`Toggle ${GRADE_LABELS[token]}`}
            className={`px-2 py-1 rounded-full border text-xs transition ${
              grade.includes(token)
                ? "border-plSky bg-plSky text-[#271b70]"
                : "border-[var(--color-border)] bg-transparent text-[color:var(--color-text-muted)]"
            }`}
            onClick={() => toggleGrade(token)}
          >
            {token}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={missingSubjects}
        title="Show students missing subjects"
        className={`px-2 py-1 rounded-full border text-xs transition ${
          missingSubjects
            ? "border-plSky bg-plSky text-[#271b70]"
            : "border-[var(--color-border)] bg-transparent text-[color:var(--color-text-muted)]"
        }`}
        onClick={() => toggleFlag("missingSubjects")}
      >
        Missing subjects
      </button>
      <button
        type="button"
        aria-pressed={missingClasses}
        title="Show students missing class assignments"
        className={`px-2 py-1 rounded-full border text-xs transition ${
          missingClasses
            ? "border-plSky bg-plSky text-[#271b70]"
            : "border-[var(--color-border)] bg-transparent text-[color:var(--color-text-muted)]"
        }`}
        onClick={() => toggleFlag("missingClasses")}
      >
        Missing classes
      </button>
      <button
        type="button"
        aria-pressed={multiGrade}
        title="Show students assigned to multiple grades"
        className={`px-2 py-1 rounded-full border text-xs transition ${
          multiGrade
            ? "border-plSky bg-plSky text-[#271b70]"
            : "border-[var(--color-border)] bg-transparent text-[color:var(--color-text-muted)]"
        }`}
        onClick={() => toggleFlag("multiGrade")}
      >
        Multi-grade
      </button>
    </div>
  );
};

export default StudentFilters;
