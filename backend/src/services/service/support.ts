import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();


export const generateUniqueServiceCode = async (): Promise<string> => {
  return await prisma.$transaction(async (tx) => {
    // Get the highest serviceID - this will have a lock on the table
    const highestRecord = await tx.service.findFirst({
      orderBy: { serviceID: 'desc' },
    });
    const nextId = highestRecord ? highestRecord.serviceID + 1 : 1;
    const code = `SRV${nextId.toString().padStart(5, "0")}`;
    // Check if code exists (rare case but possible if codes were manually set)
    const existingCode = await tx.service.findUnique({
      where: { serviceCode: code },
    });
    // If code already exists somehow, add a random suffix
    if (existingCode) {
      const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
      return `SRV${nextId.toString().padStart(5, "0")}-${randomSuffix}`;
    }
    return code;
  });
};

// Keep the old function for backward compatibility
export const createAutoCareCode = (latestID: number): string => {
  const incrementedNumber = latestID + 1;
  return `AC${incrementedNumber.toString().padStart(3, "0")}`;
};