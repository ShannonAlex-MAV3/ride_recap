import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
const prisma = new PrismaClient();

/**
 * Generate a unique file reference
 */
export async function generateUniqueFileReference(): Promise<string> {
    let reference: string;
    let exists = true;
    do {
        reference = randomUUID();
        const file = await prisma.file.findUnique({ where: { reference } });
        exists = !!file;
    } while (exists);
    return reference;
}