-- CreateTable
CREATE TABLE "Repair" (
    "repairID" SERIAL NOT NULL,
    "repairCode" TEXT NOT NULL,
    "customerID" INTEGER NOT NULL,
    "vehicleID" INTEGER NOT NULL,
    "jobID" INTEGER NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "mechanic" INTEGER NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("repairID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repair_repairCode_key" ON "Repair"("repairCode");
