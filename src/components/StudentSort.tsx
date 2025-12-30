"use client";

import { useRouter } from "next/navigation";

import {
  DirectoryPageSize,
  DirectorySort,
  PAGE_SIZE_LABELS,
  PAGE_SIZE_OPTIONS,
  SORT_LABELS,
  SORT_OPTIONS,
} from "@/lib/studentDirectoryConfig";

type StudentSortProps = {
  sort: DirectorySort;
  pageSize: DirectoryPageSize;
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

const StudentSort = ({ sort, pageSize }: StudentSortProps) => {
  const router = useRouter();

  const onSortChange = (value: DirectorySort) => {
    router.push(buildUrlWithPatch({ sort: value, page: "1" }));
  };

  const onPageSizeChange = (size: DirectoryPageSize) => {
    router.push(buildUrlWithPatch({ pageSize: size.toString(), page: "1" }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-muted)]">
      <label className="text-[11px] font-semibold uppercase tracking-wider">
        Sort
      </label>
      <select
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-xs text-[color:var(--color-text-primary)]"
        aria-label="Sort students"
        value={sort}
        onChange={(event) => onSortChange(event.target.value as DirectorySort)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
      <label className="text-[11px] font-semibold uppercase tracking-wider">
        Rows
      </label>
      <select
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-1 text-xs text-[color:var(--color-text-primary)]"
        aria-label="Rows per page"
        value={pageSize}
        onChange={(event) =>
          onPageSizeChange(Number(event.target.value) as DirectoryPageSize)
        }
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {PAGE_SIZE_LABELS[size]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StudentSort;
