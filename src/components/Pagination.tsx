"use client";

import { useRouter } from "next/navigation";
import { ITEM_PER_PAGE } from "@/lib/settings";

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

const Pagination = ({
  page,
  count,
  pageSize = ITEM_PER_PAGE,
}: {
  page: number;
  count: number;
  pageSize?: number;
}) => {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    router.push(buildUrlWithPatch({ page: newPage.toString() }));
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          changePage(page - 1);
        }}
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageIndex = index + 1;
          return (
            <button
              key={pageIndex}
              className={`px-2 rounded-sm ${page === pageIndex ? "bg-plSky" : ""}`}
              onClick={() => {
                changePage(pageIndex);
              }}
            >
              {pageIndex}
            </button>
          );
        })}
      </div>
      <button
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!hasNext}
        onClick={() => {
          changePage(page + 1);
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
