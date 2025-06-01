-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "reference" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "serviceID" SERIAL NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "customerID" INTEGER NOT NULL,
    "vehicleID" INTEGER NOT NULL,
    "jobID" INTEGER NOT NULL,
    "currentMileage" INTEGER NOT NULL,
    "mechanicID" INTEGER NOT NULL,
    "maintenance" JSONB NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("serviceID")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_reference_key" ON "File"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Service_serviceCode_key" ON "Service"("serviceCode");
