import type { TeacherWithRelations } from "../repositories/teacherRepository";
import {
  buildTeacherWhere,
  countTeachers,
  fetchTeachers,
} from "../repositories/teacherRepository";
import type { TeacherFilters } from "../types/filters";
import type { PaginationMeta, PaginationParams } from "../types/pagination";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination";

export type TeacherDirectoryRequest = PaginationParams &
  TeacherFilters & {
    search?: string;
  };

export type TeacherDirectoryResponse = {
  teachers: TeacherWithRelations[];
  pagination: PaginationMeta;
};

export const getTeacherDirectory = async (
  params: TeacherDirectoryRequest
): Promise<TeacherDirectoryResponse> => {
  const paginationResolution = resolvePagination({
    page: params.page,
    pageSize: params.pageSize,
  });

  const filters: TeacherFilters = {
    classId: params.classId,
  };

  const where = buildTeacherWhere(params.search, filters);

  const [teachers, total] = await Promise.all([
    fetchTeachers(where, paginationResolution.skip, paginationResolution.take),
    countTeachers(where),
  ]);

  return {
    teachers,
    pagination: buildPaginationMeta(
      paginationResolution.page,
      paginationResolution.pageSize,
      total
    ),
  };
};
