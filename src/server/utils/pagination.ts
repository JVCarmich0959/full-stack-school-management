import { ITEM_PER_PAGE } from "@/lib/settings";

import type { PaginationMeta, PaginationParams } from "../types/pagination";

export type PaginationResolution = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export const resolvePagination = (
  params?: PaginationParams,
  fallback = ITEM_PER_PAGE
): PaginationResolution => {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = Math.max(1, params?.pageSize ?? fallback);
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    take: pageSize,
  };
};

export const buildPaginationMeta = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  pageSize,
  total,
  pageCount: Math.max(1, Math.ceil(total / pageSize)),
});
