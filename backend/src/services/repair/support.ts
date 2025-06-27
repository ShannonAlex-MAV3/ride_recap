import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import logger from "../../logger";
import { sendEmail } from "../common/emailService";
import { Repair, RepairEmail } from "../../@types";

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

export const notifyRepairCreation = async (sendTo: string, repairMailDetails: RepairEmail) => {

  try {
    await sendEmail({
      to: sendTo,
      type: 'REPAIR', //TODO add to type
      data: { ...repairMailDetails },
      subject: `Repair Summary for ${repairMailDetails.licensePlate}`,
      html: true,
      templateName: "repair"  // TODO: constant or env??
    });
  } catch (err) {
    logger.warn('Failed to send repair notification email:', err);
  }
};

export const prepareHTMLContentForRepair = async (repair: Repair) => {

  const { customerID, vehicleID, jobID, repairCode, total } = repair;

  let customerSql =
    `
    SELECT 
      c."firstName",
      c."lastName",
      v."vehicleID",
      v."licensePlate",
      v."make",
      v."model"
    FROM "Customer" c
    INNER JOIN "Vehicle" v ON c."customerID" = v."customerID"
    WHERE c."customerID" = $1 AND v."vehicleID" = $2     
    `;

  // Used $1, $2, etc. in SQL for parameter safety (not string interpolation).

  let jobSql =
    `
    SELECT 
      j."jobName"
    FROM "JobConfig" j
    WHERE j."jobID" = $1
    `;

  const customerWithVehicleDetails = await prisma.$queryRawUnsafe<any>(customerSql, customerID, vehicleID);
  const jobDetails = await prisma.$queryRawUnsafe<any>(jobSql, jobID);

  console.log("customerWithVehicleDetails", customerWithVehicleDetails)
  console.log("jobDetails", jobDetails)

  if (!customerWithVehicleDetails.length || !jobDetails.length) return null;

  const customer = customerWithVehicleDetails[0];
  const job = jobDetails[0];

  const customerName = `${customer.firstName} ${customer.lastName}`;
  const vehicleMakeModel = customer.make && customer.model ? `${customer.make} ${customer.model}` : null;

  const emailData: RepairEmail = {
    repairCode: repairCode ?? "XXXXX",
    customerName: customerName,
    licensePlate: customer.licensePlate,
    vehicleMakeModel: vehicleMakeModel,
    jobName: job.jobName,
    total: total ?? 0,
  };

  return emailData;
}