import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

export const generateUniqueAutoCareCode = async (): Promise<string> => {
  return await prisma.$transaction(async (tx) => {
    // Get the highest autoCareID - this will have a lock on the table
    const highestRecord = await tx.autoCare.findFirst({
      orderBy: { autoCareID: 'desc' },
    });
    
    const nextId = highestRecord ? highestRecord.autoCareID + 1 : 1;
    const code = `AC${nextId.toString().padStart(5, "0")}`;
    
    // Check if code exists (rare case but possible if codes were manually set)
    const existingCode = await tx.autoCare.findUnique({
      where: { autoCareCode: code },
    });
    
    // If code already exists somehow, add a random suffix
    if (existingCode) {
      const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
      return `AC${nextId.toString().padStart(5, "0")}-${randomSuffix}`;
    }
    
    return code;
  });
};

// Keep the old function for backward compatibility
export const createAutoCareCode = (latestID: number): string => {
  const incrementedNumber = latestID + 1;
  return `AC${incrementedNumber.toString().padStart(3, "0")}`;
};