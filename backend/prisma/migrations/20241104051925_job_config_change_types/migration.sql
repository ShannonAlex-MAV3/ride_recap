/*
  Warnings:

  - The `status` column on the `JobConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `JobConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACT', 'INA');

-- CreateEnum
CREATE TYPE "JobCategoriesP" AS ENUM ('GM', 'ID', 'ER', 'BS', 'TS', 'AC', 'BP', 'TW');

-- AlterTable
ALTER TABLE "JobConfig" DROP COLUMN "category";
ALTER TABLE "JobConfig" ADD COLUMN     "category" "JobCategoriesP" NOT NULL;
ALTER TABLE "JobConfig" DROP COLUMN "status";
ALTER TABLE "JobConfig" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'ACT';

-- DropEnum
DROP TYPE "JobCategories";

-- DropEnum
DROP TYPE "Status";
