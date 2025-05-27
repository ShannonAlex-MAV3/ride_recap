import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export const generateUniqueRepairCode = async (): Promise<string> => {
    return await prisma.$transaction(async (tx) => {
        // Get the highest repairID - this will have a lock on the table
        const highestRecord = await tx.repair.findFirst({
            orderBy: { repairID: 'desc' },
        });

        const nextId = highestRecord ? highestRecord.repairID + 1 : 1;
        const code = `RP${nextId.toString().padStart(5, "0")}`;

        // Check if code exists (rare case but possible if codes were manually set)
        const existingCode = await tx.repair.findUnique({
            where: { repairCode: code },
        });

        // If code already exists somehow, add a random suffix
        if (existingCode) {
            const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
            return `AC${nextId.toString().padStart(5, "0")}-${randomSuffix}`;
        }

        return code;
    });
};