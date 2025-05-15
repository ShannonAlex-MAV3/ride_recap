/*
  Warnings:

  - The `status` column on the `JobConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusP" AS ENUM ('ACT', 'INA');

-- AlterTable
ALTER TABLE "JobConfig" DROP COLUMN "status";
ALTER TABLE "JobConfig" ADD COLUMN     "status" "StatusP" NOT NULL DEFAULT 'ACT';

-- DropEnum
DROP TYPE "JobStatus";
