import { Repair, RepairWithDetails } from '../../@types';
import logger from '../../logger';
import { PrismaClient } from "@prisma/client";
import { generateUniqueRepairCode } from './support';
import { getS3Service } from '../storage/storage';

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
  const s3 = getS3Service();

  const attachments = [];
  if (repairData.attachments || repairData.attachments.length !== 0) {
    for (const attachment of repairData.attachments) {
      const savedFile = await s3.uploadData(attachment);
      attachments.push({
        fileID: savedFile.id,
        reference: savedFile.reference,
      });
    }
  }

  // Generate a unique auto care code
  const repairCode = await generateUniqueRepairCode();

  // Do we need to add date?
  const newRepair = await prisma.repair.create({
    data: {
      repairCode,
      customerID: parseInt(repairData.customerID),
      vehicleID: parseInt(repairData.vehicleID),
      jobID: parseInt(repairData.jobID),
      currentMileage: parseInt(repairData.currentMileage) || 0,
      mechanicID: parseInt(repairData.mechanicID),
      total: parseInt(repairData.total) || 0,
      status: repairData.status,
      createdAt: new Date(),
      attachments: {
        create: attachments,
      }
    },
  });

  const attachmentRefs = await Promise.all(
    attachments.map(async (att) => {
      const url = await s3.getPresignedUrl(att.reference);
      logger.info(`Generated presigned URL for attachment: ${att.reference}`);
      return url;
    })
  );

  logger.info(`Repair record created successfully with code: ${repairCode}`);
  // Parse or cast the metricConfig to match AutoCare type
  return {
    ...newRepair,
    attachments: [],
    attachmentRefs,
  } as Repair;
}

export const getRepairById = async (repairID: number): Promise<Repair | null> => {
  logger.info(`Start: Fetching Repair record by ID: ${repairID}`);

  const s3 = getS3Service();

  const repair = await prisma.repair.findUnique({
    where: {
      repairID,
    },
    include: {
      attachments: {
        where: {
          status: 'ACT'
        }
      },
    },
  });

  if (!repair) {
    logger.warn(`No Repair record found with ID: ${repairID}`);
    return null;
  }

  // Generate presigned URLs for all attachments
  const attachmentRefs = await Promise.all(
    repair.attachments.map(async (att) => {
      const url = await s3.getPresignedUrl(att.reference);
      logger.info(`Generated presigned URL for attachment: ${att.reference}`);
      return url;
    })
  );

  logger.info(`Fetched Repair record: ${JSON.stringify(repair)}`);

  return {
    ...repair,
    attachments: [],
    attachmentRefs
  } as Repair;
}

export const updateRepair = async (repairID: number, repairData: any): Promise<Repair> => {
  logger.info(`Start: Updating Repair record with ID: ${repairID}`);
  const s3 = getS3Service();

  // Fetch existing service attachments
  const existingRepair = await prisma.repair.findUnique({
    where: { repairID },
    include: {
      attachments: {
        where: { status: 'ACT' }
      }
    }
  });

  if (!existingRepair) {
    logger.error(`Repair with ID ${repairID} not found`);
    throw new Error(`Repair with ID ${repairID} not found`);
  }

  const newAttachments: { fileID: any; reference: any; }[] = [];
  for (const attachment of repairData.attachments) {
    const savedFile = await s3.uploadData(attachment);
    newAttachments.push({
      fileID: savedFile.id,
      reference: savedFile.reference,
    });
  }

  // Opens a DB transaction so all DB updates happen safely together.
  const updatedRepair = await prisma.$transaction(async (prismaClient) => {
    // Mark attachments that are not in the attachmentRefs in repairData as inactive
    if (existingRepair.attachments.length > 0) {
      const referencesToKeep = repairData.attachmentsRefs ? JSON.parse(repairData.attachmentsRefs) : [];

      const attachmentsToInactivate = existingRepair.attachments.filter(
        attachment => !referencesToKeep.some((ref: string) => ref.includes(attachment.reference))
      );

      // Perform batch update instead of individual updates
      if (attachmentsToInactivate.length > 0) {
        attachmentsToInactivate.forEach(attachment => {
          logger.info(`Marking attachment with reference ${attachment.reference} as inactive`);
        });

        // Execute updates in parallel instead of sequentially
        await Promise.all(
          attachmentsToInactivate.map(attachment =>
            prismaClient.repairAttachment.update({
              where: {
                repairID_fileID_reference: {
                  repairID: repairID,
                  fileID: attachment.fileID,
                  reference: attachment.reference
                }
              },
              data: {
                status: 'INA',
                updatedAt: new Date()
              }
            })
          )
        );

        logger.info(`Marked ${attachmentsToInactivate.length} attachments as inactive`);
      }
    }

    // Add new attachments in parallel
    if (newAttachments.length > 0) {
      await Promise.all(
        newAttachments.map(attachment =>
          prismaClient.repairAttachment.create({
            data: {
              repairID,
              fileID: attachment.fileID,
              reference: attachment.reference,
              status: 'ACT',
              createdAt: new Date()
            }
          })
        )
      );
      logger.info(`Added ${newAttachments.length} new attachments`);
    }

    // Update the service record
    const updated = await prismaClient.repair.update({
      where: { repairID },
      data: {
        currentMileage: parseInt(repairData.currentMileage) || 0,
        total: parseInt(repairData.total) || 0,
        status: repairData.status,
        updatedAt: new Date(),
      },
      include: {
        attachments: {
          where: { status: 'ACT' }
        }
      },
    });

    return updated;
  });

  const attachmentRefs = await Promise.all(
    updatedRepair.attachments.map(async (att) => {
      const url = await s3.getPresignedUrl(att.reference);
      logger.info(`Generated presigned URL for attachment: ${att.reference}`);
      return url;
    })
  );

  logger.info(`Repair with ID ${repairID} updated successfully.`);

  // Parse or cast the metricConfig to match AutoCare type
  return {
    ...updatedRepair,
    attachmentRefs,
    attachments: [],
  } as Repair;
}

export const getAllRepairsWithRelationDetails = async (customerIds?: number[], vehicleLicensePlate?: string): Promise<RepairWithDetails[]> => {
  logger.info("Start: Fetching all Repair records.");
  logger.info(`Filters - customerIds: ${customerIds}, vehicleLicensePlate: ${vehicleLicensePlate}`);

  // const repairs = await prisma.$queryRaw<RepairWithDetails[]>
  let sql =
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
    WHERE 1=1
    `;

  const params: any[] = [];

  // Add customerIds filter if provided
  if (customerIds && customerIds.length > 0) {
    sql += ` AND r."customerID" IN (${customerIds.map((_, i) => `$${i + 1}`).join(',')})`;
    params.push(...customerIds);
  }

  // Add vehicle license plate filter if provided
  if (vehicleLicensePlate) {
    sql += ` AND v."licensePlate" ILIKE $${params.length + 1}`;
    params.push(`%${vehicleLicensePlate}%`);
  }

  sql += ` ORDER BY r."repairID" DESC`;

  // Execute the query with parameters
  const repairs = await prisma.$queryRawUnsafe(sql, ...params);

  // Group services and their attachments
  const repairMap = new Map();

  // Process raw results and group by repairID
  for (const row of repairs as any[]) {
    if (!repairMap.has(row.repairID)) {
      repairMap.set(row.repairID, {
        ...row,
      });
    }
  }

  const result = Array.from(repairMap.values());

  logger.info(`Fetched ${result.length} Repair records.`);

  return result as RepairWithDetails[];
}