import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const randomScore = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min);

/**
 * Injects random demo data for classroom performance testing.
 */
export const seedPerformanceData = async () => {
  const students = await prisma.student.findMany({ take: 20 });

  await Promise.all(
    students.map((student) =>
      prisma.result.upsert({
        where: { id: student.id.slice(0, 10).split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) },
        update: {},
        create: {
          score: randomScore(70, 98),
          studentId: student.id,
        },
      })
    )
  );
};

// TODO: Connect real scores from assessments once integrated
