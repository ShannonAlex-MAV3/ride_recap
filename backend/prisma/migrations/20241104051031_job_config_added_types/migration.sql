/*
  Warnings:

  - The `status` column on the `JobConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `JobConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterSequence
ALTER SEQUENCE "_prisma_new_JobConfig_jobID_seq" MAXVALUE 9223372036854775807;

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACT', 'INA');

-- CreateEnum
CREATE TYPE "JobCategories" AS ENUM ('GM', 'ID', 'ER', 'BS', 'TS', 'AC', 'BP', 'TW');

-- AlterTable
ALTER TABLE "JobConfig" DROP COLUMN "category";
ALTER TABLE "JobConfig" ADD COLUMN     "category" "JobCategories" NOT NULL;
ALTER TABLE "JobConfig" DROP COLUMN "status";
ALTER TABLE "JobConfig" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACT';

-- DropEnum
DROP TYPE "JobStatus";
