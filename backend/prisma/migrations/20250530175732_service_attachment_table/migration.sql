-- CreateTable
CREATE TABLE "ServiceAttachment" (
    "serviceID" INTEGER NOT NULL,
    "fileID" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceAttachment_pkey" PRIMARY KEY ("serviceID","fileID","reference")
);

-- AddForeignKey
ALTER TABLE "ServiceAttachment" ADD CONSTRAINT "ServiceAttachment_serviceID_fkey" FOREIGN KEY ("serviceID") REFERENCES "Service"("serviceID") ON DELETE RESTRICT ON UPDATE CASCADE;
