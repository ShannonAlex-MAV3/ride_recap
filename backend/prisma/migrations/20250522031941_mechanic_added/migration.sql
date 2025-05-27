-- CreateEnum
CREATE TYPE "MechanicType" AS ENUM ('MM', 'SM');

-- CreateTable
CREATE TABLE "Mechanic" (
    "mechanicID" SERIAL NOT NULL,
    "nic" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "mechanicType" "MechanicType" NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Mechanic_pkey" PRIMARY KEY ("mechanicID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mechanic_nic_key" ON "Mechanic"("nic");
