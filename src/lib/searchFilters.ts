import { Prisma } from "@prisma/client";

const isSQLiteProvider = (): boolean => {
  const databaseUrl = process.env.DATABASE_URL || "";
  return databaseUrl.startsWith("file:") || databaseUrl.includes("sqlite");
};

export const buildStringSearchFilter = (value: string): Prisma.StringFilter => {
  const filter: Prisma.StringFilter = { contains: value };

  if (!isSQLiteProvider()) {
    filter.mode = "insensitive";
  }

  return filter;
};
