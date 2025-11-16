/*
  Warnings:
  - Added the required column `fullNameLower` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cleverId` to the `Student` table without a default value. This is not possible if the table is not empty.
*/

-- AlterTable
ALTER TABLE "Student"
    ADD COLUMN     "fullNameLower" TEXT NOT NULL DEFAULT '',
    ADD COLUMN     "cleverId" TEXT NOT NULL DEFAULT '',
    ADD COLUMN     "testingId" TEXT,
    ADD COLUMN     "esparkUsername" TEXT,
    ADD COLUMN     "esparkPassword" TEXT,
    ADD COLUMN     "hasEsparkCreds" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN     "guardianName" TEXT,
    ADD COLUMN     "guardianEmail" TEXT,
    ADD COLUMN     "guardianPhone" TEXT;

-- AlterTable
ALTER TABLE "Parent"
    ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Teacher"
    ADD COLUMN     "shortName" TEXT;

-- DropIndex
DROP INDEX IF EXISTS "Parent_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "Student_cleverId_key" ON "Student"("cleverId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_testingId_key" ON "Student"("testingId");

-- CreateIndex
CREATE INDEX "Student_fullNameLower_idx" ON "Student"("fullNameLower");

-- CreateIndex
CREATE INDEX "Teacher_shortName_idx" ON "Teacher"("shortName");

-- Drop and recreate defaults to align with Prisma schema
ALTER TABLE "Student"
    ALTER COLUMN "fullNameLower" DROP DEFAULT,
    ALTER COLUMN "cleverId" DROP DEFAULT;
