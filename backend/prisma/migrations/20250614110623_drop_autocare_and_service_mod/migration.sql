/*
  Warnings:

  - You are about to drop the `AutoCare` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "serviceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "AutoCare";
