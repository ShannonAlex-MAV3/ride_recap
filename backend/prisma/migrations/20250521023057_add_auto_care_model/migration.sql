-- CreateTable
CREATE TABLE "AutoCare" (
    "autoCareID" SERIAL NOT NULL,
    "autoCareCode" TEXT NOT NULL,
    "customerID" INTEGER NOT NULL,
    "vehicleID" INTEGER NOT NULL,
    "jobID" INTEGER NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "metricConfig" JSONB NOT NULL,
    "mechanic" TEXT NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AutoCare_pkey" PRIMARY KEY ("autoCareID")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoCare_autoCareCode_key" ON "AutoCare"("autoCareCode");
