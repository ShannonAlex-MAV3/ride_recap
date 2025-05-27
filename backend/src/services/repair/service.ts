import { Repair, RepairWithDetails } from '../../@types';
import logger from '../../logger';
import { PrismaClient } from "@prisma/client";
import { generateUniqueRepairCode } from './support';

const prisma = new PrismaClient();

export const getAllRepairs = async (): Promise<Repair[]> => {
  logger.info("Start: Fetching all Repair records.");

  const repairs = await prisma.repair.findMany({
    orderBy: [
      {
        customerID: 'asc',
      },
    ]
  });

  logger.info(`Fetched ${repairs.length} Repair records.`);

  return repairs as Repair[];
}

export const addRepair = async (repairData: any): Promise<Repair> => {
  // TODO: check relational entities status Validations!!
  logger.info("Start: Saving new Repair record.");
  // Generate a unique auto care code
  const repairCode = await generateUniqueRepairCode();

  const newRepair = await prisma.repair.create({
    data: {
      repairCode,
      customerID: repairData.customerID,
      vehicleID: repairData.vehicleID,
      jobID: repairData.jobID,
      currentMileage: repairData.currentMileage || 0,
      mechanicID: repairData.mechanicID || '',
      status: repairData.status,
    },
  });
  logger.info(`Repair record created successfully with code: ${repairCode}`);
  // Parse or cast the metricConfig to match AutoCare type
  return newRepair as Repair;
}

export const getRepairById = async (repairId: number): Promise<Repair | null> => {
  logger.info(`Start: Fetching Repair record by ID: ${repairId}`);

  const repair = await prisma.repair.findUnique({
    where: {
      repairID: repairId,
    },
  });

  if (!repair) {
    logger.warn(`No Repair record found with ID: ${repairId}`);
    return null;
  }

  logger.info(`Fetched Repair record: ${JSON.stringify(repair)}`);

  // Parse or cast the metricConfig to match AutoCare type
  return repair as Repair;
}

export const updateRepair = async (repairId: number, repairData: any): Promise<Repair> => {
  logger.info(`Start: Updating Repair record with ID: ${repairId}`);

  const updatedRepair = await prisma.repair.update({
    where: {
      repairID: repairId,
    },
    data: {
      ...repairData,
      updatedAt: new Date(),
    },
  });

  logger.info(`Repair with ID ${repairId} updated successfully.`);

  // Parse or cast the metricConfig to match AutoCare type
  return updatedRepair as Repair;
}

export const getAllRepairsWithRelationDetails = async (): Promise<RepairWithDetails[]> => {
  logger.info("Start: Fetching all Repair records.");

  const repairs = await prisma.$queryRaw<RepairWithDetails[]>
    `
    SELECT 
      r."repairID",
      r."repairCode",
      r."customerID",
      c."firstName",
      c."lastName",
      c."customerCode",
      r."vehicleID",
      v."licensePlate",
      r."jobID",
      j."jobCode",
      j."jobName",
      r."currentMileage",
      r."mechanicID",
      r."status",
      r."createdAt",
      r."updatedAt"
    FROM "Repair" r
    LEFT JOIN "Customer" c ON r."customerID" = c."customerID"
    LEFT JOIN "Vehicle" v ON r."vehicleID" = v."vehicleID"
    LEFT JOIN "JobConfig" j ON r."jobID" = j."jobID"
    ORDER BY r."customerID" ASC
    `;

  logger.info(`Fetched ${repairs.length} Repair records.`);

  return repairs as RepairWithDetails[];
}