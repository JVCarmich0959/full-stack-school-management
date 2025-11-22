import type { StudentWithClass } from "../repositories/studentRepository";
import {
  buildStudentWhere,
  countStudents,
  fetchStudents,
} from "../repositories/studentRepository";
import type { StudentFilters } from "../types/filters";
import type { PaginationMeta, PaginationParams } from "../types/pagination";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination";

export type StudentDirectoryRequest = PaginationParams &
  StudentFilters & {
    search?: string;
  };

export type StudentDirectoryResponse = {
  students: StudentWithClass[];
  pagination: PaginationMeta;
};

export const getStudentDirectory = async (
  params: StudentDirectoryRequest
): Promise<StudentDirectoryResponse> => {
  const paginationResolution = resolvePagination({
    page: params.page,
    pageSize: params.pageSize,
  });

  const filters: StudentFilters = {
    grade: params.grade,
    teacherId: params.teacherId,
  };

  const where = buildStudentWhere(params.search, filters);

  const [students, total] = await Promise.all([
    fetchStudents(where, paginationResolution.skip, paginationResolution.take),
    countStudents(where),
  ]);

  return {
    students,
    pagination: buildPaginationMeta(
      paginationResolution.page,
      paginationResolution.pageSize,
      total
    ),
  };
};
