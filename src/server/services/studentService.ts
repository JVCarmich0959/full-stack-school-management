import type { Prisma } from "@prisma/client";
import type { StudentWithClass } from "../repositories/studentRepository";
import { countStudents, fetchStudents } from "../repositories/studentRepository";
import type { PaginationMeta } from "../types/pagination";
import { buildPaginationMeta, resolvePagination } from "../utils/pagination";
import {
  DirectoryGradeToken,
  DirectoryPageSize,
  DirectorySort,
  GRADE_TOKENS,
  GRADE_TOKEN_TO_LEVEL,
  extractGradeToken,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/studentDirectoryConfig";

export type StudentDirectoryQuery = {
  q?: string;
  page: number;
  pageSize: DirectoryPageSize;
  sort: DirectorySort;
  grade: DirectoryGradeToken[];
  missingSubjects: boolean;
  missingClasses: boolean;
  multiGrade: boolean;
};

export type StudentDirectoryResponse = {
  students: StudentWithClass[];
  pagination: PaginationMeta;
};

const clampPageSize = (value?: number): DirectoryPageSize => {
  if (!Number.isFinite(value ?? NaN)) {
    return PAGE_SIZE_OPTIONS[0];
  }
  const candidate = PAGE_SIZE_OPTIONS.find((size) => size === value);
  return candidate ?? PAGE_SIZE_OPTIONS[0];
};

const parseBooleanFlag = (value: string | undefined) => value === "1";

const multiGradeIndicators = ["-", "&", "/"];

const buildSearchFilter = (q: string): Prisma.StudentWhereInput => {
  const normalized = q.trim();
  const lowerValue = normalized.toLowerCase();
  const gradeToken = extractGradeToken(normalized);
  const searchOperands: Prisma.StudentWhereInput[] = [
    { name: { contains: normalized, mode: "insensitive" } },
    { surname: { contains: normalized, mode: "insensitive" } },
    { firstName: { contains: normalized, mode: "insensitive" } },
    { lastName: { contains: normalized, mode: "insensitive" } },
    { username: { contains: normalized, mode: "insensitive" } },
    { email: { contains: normalized, mode: "insensitive" } },
    { cleverId: { contains: normalized, mode: "insensitive" } },
    { testingId: { contains: normalized, mode: "insensitive" } },
    { fullNameLower: { contains: lowerValue } },
    { class: { name: { contains: normalized, mode: "insensitive" } } },
    {
      class: {
        lessons: {
          some: {
            teacherId: { contains: normalized, mode: "insensitive" },
          },
        },
      },
    },
    {
      class: {
        lessons: {
          some: {
            subject: {
              name: { contains: normalized, mode: "insensitive" },
            },
          },
        },
      },
    },
  ];

  if (gradeToken) {
    const level = GRADE_TOKEN_TO_LEVEL[gradeToken];
    searchOperands.push({ grade: { level } });
    searchOperands.push({
      class: {
        grade: {
          level,
        },
      },
    });
  }

  return { OR: searchOperands };
};

const buildStudentFilters = (
  query: StudentDirectoryQuery
): Prisma.StudentWhereInput | undefined => {
  const clauses: Prisma.StudentWhereInput[] = [];

  if (query.grade.length > 0) {
    const gradeLevels = query.grade
      .map((token) => GRADE_TOKEN_TO_LEVEL[token])
      .filter((level) => Number.isFinite(level));
    if (gradeLevels.length > 0) {
      clauses.push({
        OR: [
          { grade: { level: { in: gradeLevels } } },
          { class: { grade: { level: { in: gradeLevels } } } },
        ],
      });
    }
  }

  if (query.missingClasses) {
    clauses.push({
      class: {
        is: null,
      },
    });
  }

  if (query.missingSubjects) {
    clauses.push({
      class: {
        lessons: {
          none: {},
        },
      },
    });
  }

  if (query.multiGrade) {
    clauses.push({
      OR: multiGradeIndicators.map((symbol) => ({
        class: {
          name: {
            contains: symbol,
            mode: "insensitive",
          },
        },
      })),
    });
  }

  if (query.q) {
    clauses.push(buildSearchFilter(query.q));
  }

  if (clauses.length === 0) {
    return undefined;
  }

  return clauses.length === 1 ? clauses[0] : { AND: clauses };
};

const buildOrderBy = (
  sort: DirectorySort
): Prisma.StudentOrderByWithRelationInput[] => {
  switch (sort) {
    case "name_asc":
      return [{ name: "asc" }, { surname: "asc" }, { createdAt: "desc" }];
    case "created_desc":
      return [{ createdAt: "desc" }];
    case "grade_name":
    default:
      return [
        { grade: { level: "asc" } },
        { name: "asc" },
        { surname: "asc" },
      ];
  }
};

const pickFirst = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

export const parseDirectoryQuery = (
  searchParams: Record<string, string | string[] | undefined>
): StudentDirectoryQuery => {
  const rawPage = Number.parseInt(pickFirst(searchParams.page) ?? "", 10);
  const rawPageSize = Number.parseInt(
    pickFirst(searchParams.pageSize) ?? "",
    10
  );
  const sortCandidate = pickFirst(searchParams.sort);
  const gradeParam = pickFirst(searchParams.grade);

  const gradeTokens = gradeParam
    ? Array.from(
        new Set(
          gradeParam
            .split(",")
            .map((token) => token.trim().toUpperCase())
            .filter((token) => GRADE_TOKENS.includes(token as DirectoryGradeToken))
        )
      ) as DirectoryGradeToken[]
    : [];

  const normalizedSort =
    sortCandidate && SORT_OPTIONS.includes(sortCandidate as DirectorySort)
      ? (sortCandidate as DirectorySort)
      : SORT_OPTIONS[0];

  const qCandidate = pickFirst(searchParams.q)?.trim() ?? "";

  return {
    q: qCandidate || undefined,
    page: Math.max(1, Number.isFinite(rawPage) ? rawPage : 1),
    pageSize: clampPageSize(rawPageSize),
    sort: normalizedSort,
    grade: gradeTokens,
    missingSubjects: parseBooleanFlag(pickFirst(searchParams.missingSubjects)),
    missingClasses: parseBooleanFlag(pickFirst(searchParams.missingClasses)),
    multiGrade: parseBooleanFlag(pickFirst(searchParams.multiGrade)),
  };
};

export const getStudentDirectory = async (
  query: StudentDirectoryQuery
): Promise<StudentDirectoryResponse> => {
  const paginationResolution = resolvePagination({
    page: query.page,
    pageSize: query.pageSize,
  });

  const where = buildStudentFilters(query);
  const orderBy = buildOrderBy(query.sort);

  const [students, total] = await Promise.all([
    fetchStudents(
      where ?? undefined,
      paginationResolution.skip,
      paginationResolution.take,
      orderBy
    ),
    countStudents(where ?? undefined),
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
