/*
  Warnings:

  - You are about to drop the column `mechanic` on the `Repair` table. All the data in the column will be lost.
  - Added the required column `mechanicID` to the `Repair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repair" DROP COLUMN "mechanic",
ADD COLUMN     "mechanicID" INTEGER NOT NULL;
