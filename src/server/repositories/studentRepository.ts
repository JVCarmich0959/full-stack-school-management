import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type StudentWithClass = Prisma.StudentGetPayload<{
  include: {
    class: {
      include: {
        grade: true;
        lessons: {
          include: { subject: true };
        };
      };
    };
    grade: true;
  };
}>;

export const fetchStudents = (
  where: Prisma.StudentWhereInput | undefined,
  skip: number,
  take: number,
  orderBy: Prisma.StudentOrderByWithRelationInput[]
) =>
  prisma.student.findMany({
    where,
    include: {
      class: {
        include: {
          grade: true,
          lessons: {
            include: {
              subject: true,
            },
          },
        },
      },
      grade: true,
    },
    orderBy,
    skip,
    take,
  });

export const countStudents = (where?: Prisma.StudentWhereInput) =>
  prisma.student.count({ where });
