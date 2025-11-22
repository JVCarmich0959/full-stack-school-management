import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import type { StudentFilters } from "../types/filters";

export type StudentWithClass = Prisma.StudentGetPayload<{
  include: { class: true };
}>;

const buildStudentFilter = (
  filters?: StudentFilters
): Prisma.StudentWhereInput => {
  if (!filters) return {};
  const where: Prisma.StudentWhereInput = {};

  if (typeof filters.grade === "number" && Number.isFinite(filters.grade)) {
    where.gradeLevel = filters.grade;
  }

  if (filters.teacherId) {
    where.class = {
      lessons: {
        some: {
          teacherId: filters.teacherId,
        },
      },
    };
  }

  return where;
};

export const buildStudentWhere = (
  search?: string,
  filters?: StudentFilters
): Prisma.StudentWhereInput => {
  const where: Prisma.StudentWhereInput = buildStudentFilter(filters);

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
};

export const fetchStudents = (
  where: Prisma.StudentWhereInput,
  skip: number,
  take: number
) =>
  prisma.student.findMany({
    where,
    include: { class: true },
    orderBy: { name: "asc" },
    skip,
    take,
  });

export const countStudents = (where: Prisma.StudentWhereInput) =>
  prisma.student.count({ where });
