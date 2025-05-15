-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACT', 'INA');

-- CreateTable
CREATE TABLE "JobConfig" (
    "id" INT4 NOT NULL,
    "jobCode" STRING NOT NULL,
    "jobName" STRING NOT NULL,
    "description" STRING,
    "category" STRING NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobConfig_jobCode_key" ON "JobConfig"("jobCode");
