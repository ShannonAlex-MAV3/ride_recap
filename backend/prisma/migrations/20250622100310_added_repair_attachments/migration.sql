-- CreateTable
CREATE TABLE "RepairAttachment" (
    "repairID" INTEGER NOT NULL,
    "fileID" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "StatusP" NOT NULL DEFAULT 'ACT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RepairAttachment_pkey" PRIMARY KEY ("repairID","fileID","reference")
);

-- AddForeignKey
ALTER TABLE "RepairAttachment" ADD CONSTRAINT "RepairAttachment_repairID_fkey" FOREIGN KEY ("repairID") REFERENCES "Repair"("repairID") ON DELETE RESTRICT ON UPDATE CASCADE;
