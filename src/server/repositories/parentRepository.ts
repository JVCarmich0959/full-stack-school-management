import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import type { ParentFilters } from "../types/filters";

export type ParentWithStudents = Prisma.ParentGetPayload<{
  include: { students: true };
}>;

const sanitizeHomeroom = (value?: string | null) =>
  value?.trim() ? value.trim() : undefined;

const hasEntries = (obj: Record<string, unknown>) =>
  Object.values(obj).some((value) => value !== undefined);

const buildStudentFilter = (filters?: ParentFilters): Prisma.StudentWhereInput => {
  if (!filters) return {};
  const studentFilter: Prisma.StudentWhereInput = {};

  if (typeof filters.grade === "number" && Number.isFinite(filters.grade)) {
    studentFilter.gradeLevel = filters.grade;
  }

  if (filters.homeroom) {
    studentFilter.homeroom = filters.homeroom;
  }

  if (filters.guardian === "complete") {
    studentFilter.guardianEmail = { not: null };
    studentFilter.NOT = { guardianEmail: "" };
  } else if (filters.guardian === "missing") {
    studentFilter.OR = [{ guardianEmail: null }, { guardianEmail: "" }];
  }

  return studentFilter;
};

export const buildParentWhere = (
  search?: string,
  filters?: ParentFilters
): Prisma.ParentWhereInput => {
  const where: Prisma.ParentWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
      {
        students: {
          some: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const studentFilter = buildStudentFilter(filters);
  if (hasEntries(studentFilter)) {
    where.students = { some: studentFilter };
  }

  return where;
};

export const fetchParents = async (
  where: Prisma.ParentWhereInput,
  skip: number,
  take: number
): Promise<ParentWithStudents[]> =>
  prisma.parent.findMany({
    where,
    include: { students: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

export const countParents = (where: Prisma.ParentWhereInput) =>
  prisma.parent.count({ where });

export const countStudentsWithGuardian = async (
  filters?: ParentFilters
): Promise<number> =>
  prisma.student.count({
    where: {
      ...buildStudentFilter(filters),
      guardianEmail: { not: null },
      NOT: { guardianEmail: "" },
    },
  });

export const countStudentsMissingGuardian = async (
  filters?: ParentFilters
): Promise<number> =>
  prisma.student.count({
    where: {
      ...buildStudentFilter(filters),
      OR: [{ guardianEmail: null }, { guardianEmail: "" }],
    },
  });

export const listGradeLevels = async (): Promise<number[]> => {
  const grades = await prisma.grade.findMany({
    select: { level: true },
    orderBy: { level: "asc" },
  });
  return grades.map((grade) => grade.level);
};

export const listHomerooms = async (): Promise<string[]> => {
  const homerooms = await prisma.student.findMany({
    where: {
      homeroom: { not: null },
    },
    select: { homeroom: true },
    distinct: ["homeroom"],
    orderBy: { homeroom: "asc" },
  });

  return homerooms
    .map((row) => sanitizeHomeroom(row.homeroom))
    .filter((value): value is string => Boolean(value));
};

const emptyStringWhere = () => ({ equals: "" as const });

export const countParentsMissingEmail = () =>
  prisma.parent.count({
    where: {
      OR: [{ email: null }, { email: emptyStringWhere() }],
    },
  });

export const countParentsMissingPhone = () =>
  prisma.parent.count({
    where: {
      OR: [{ phone: null }, { phone: emptyStringWhere() }],
    },
  });
