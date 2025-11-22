import type { ParentWithStudents } from "../repositories/parentRepository";
import {
  buildParentWhere,
  countParents,
  countParentsMissingEmail,
  countParentsMissingPhone,
  countStudentsMissingGuardian,
  countStudentsWithGuardian,
  fetchParents,
  listGradeLevels,
  listHomerooms,
} from "../repositories/parentRepository";
import type { ParentFilters } from "../types/filters";
import type { PaginationMeta, PaginationParams } from "../types/pagination";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination";

export type ParentDirectoryRequest = PaginationParams &
  ParentFilters & {
    search?: string;
  };

export type ParentDirectoryResponse = {
  parents: ParentWithStudents[];
  pagination: PaginationMeta;
  metrics: {
    totalHouseholds: number;
    studentsWithContacts: number;
    studentsMissingContacts: number;
    coverageRate: number;
  };
  filterOptions: {
    grades: number[];
    homerooms: string[];
  };
  dataQuality: {
    missingEmails: number;
    missingPhones: number;
  };
};

export const getParentDirectory = async (
  params: ParentDirectoryRequest
): Promise<ParentDirectoryResponse> => {
  const paginationResolution = resolvePagination({
    page: params.page,
    pageSize: params.pageSize,
  });

  const filters: ParentFilters = {
    grade: params.grade,
    homeroom: params.homeroom,
    guardian: params.guardian,
  };

  const where = buildParentWhere(params.search, filters);

  const [
    parents,
    totalHouseholds,
    studentsWithContacts,
    studentsMissingContacts,
    grades,
    homerooms,
    missingEmails,
    missingPhones,
  ] =
    await Promise.all([
      fetchParents(where, paginationResolution.skip, paginationResolution.take),
      countParents(where),
      countStudentsWithGuardian(filters),
      countStudentsMissingGuardian(filters),
      listGradeLevels(),
      listHomerooms(),
      countParentsMissingEmail(),
      countParentsMissingPhone(),
    ]);

  const totalStudents = studentsWithContacts + studentsMissingContacts;
  const coverageRate =
    totalStudents === 0
      ? 0
      : Math.round((studentsWithContacts / totalStudents) * 100);

  return {
    parents,
    pagination: buildPaginationMeta(
      paginationResolution.page,
      paginationResolution.pageSize,
      totalHouseholds
    ),
    metrics: {
      totalHouseholds,
      studentsWithContacts,
      studentsMissingContacts,
      coverageRate,
    },
      filterOptions: {
        grades,
        homerooms,
      },
      dataQuality: {
        missingEmails,
        missingPhones,
      },
    };
};
