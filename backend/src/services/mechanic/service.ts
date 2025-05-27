import { PrismaClient } from "@prisma/client";
import logger from "../../logger";
import { Mechanic } from "../../@types";

const prisma = new PrismaClient();

export const getAllMechanics = async (): Promise<Mechanic[]> => {
  logger.info("Start: Fetching all Mechanics");

  const mechanics = await prisma.mechanic.findMany({
    orderBy: [
      {
        mechanicID: 'asc',
      },
    ],
    // include: {
    //   vehicles: true,
    // },
  });

  logger.info(`End: Fetched ${mechanics.length} Mechanics.`);

  return mechanics;
};
