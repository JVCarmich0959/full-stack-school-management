import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import type { TeacherFilters } from "../types/filters";

export type TeacherWithRelations = Prisma.TeacherGetPayload<{
  include: { subjects: true; classes: true };
}>;

const buildClassFilter = (classId?: number): Prisma.TeacherWhereInput => {
  if (!classId || Number.isNaN(classId)) {
    return {};
  }

  return {
    lessons: {
      some: {
        classId,
      },
    },
  };
};

export const buildTeacherWhere = (
  search?: string,
  filters?: TeacherFilters
): Prisma.TeacherWhereInput => {
  const where: Prisma.TeacherWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { surname: { contains: search } },
      { shortName: { contains: search } },
    ];
  }

  const classFilter = buildClassFilter(filters?.classId);
  if (classFilter.lessons) {
    where.lessons = classFilter.lessons;
  }

  return where;
};

export const fetchTeachers = (
  where: Prisma.TeacherWhereInput,
  skip: number,
  take: number
) =>
  prisma.teacher.findMany({
    where,
    include: {
      subjects: true,
      classes: true,
    },
    orderBy: { name: "asc" },
    skip,
    take,
  });

export const countTeachers = (where: Prisma.TeacherWhereInput) =>
  prisma.teacher.count({ where });
