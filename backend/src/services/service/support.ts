import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { EmailTypeConst, Service, ServiceEmail } from "../../@types";
import logger from "../../logger";
import { sendEmail } from "../common/emailService";
import { format } from 'date-fns';
import { SERVICE_MAINTENANCE_TYPES } from "../../constants";

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

export const prepareHTMLContentForService = async (service: Service) => {

  const { customerID, vehicleID, serviceCode, currentMileage, maintenance,
    serviceDate, total, nextInterimService, note } = service;

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

  const customerWithVehicleDetails = await prisma.$queryRawUnsafe<any>(customerSql, customerID, vehicleID);

  if (!customerWithVehicleDetails.length) return null;

  const customer = customerWithVehicleDetails[0];

  const customerName = `${customer.firstName} ${customer.lastName}`;

  const formattedDate = format(new Date(serviceDate), 'EEEE, MMMM d, yyyy');

  const emailData: ServiceEmail = {
    serviceCode: serviceCode ?? "XXXXX",
    customerName: customerName,
    licensePlate: customer.licensePlate,
    total: total ?? 0,
    currentMileage: currentMileage,
    nextInterimService: nextInterimService ?? 0,
    serviceDate: formattedDate,
    note: note ?? " -",
    maintenance: maintenance,
  };

  return emailData as ServiceEmail;
}

export const notifyServiceCreation = async (sendTo: string, serviceMailDetails: ServiceEmail) => {

  const statusMap = {
    R: 'replaced',
    T: 'topUp',
    C: 'cleaned',
    N: 'na',
    Y: 'checked'
  };

  const legend = {
    R: 'Replaced',
    T: 'Topped Up',
    C: 'Cleaned',
    N: 'Not Applicable',
    Y: 'Done'
  };

  const maintenanceLabelMap: Record<string, string> = {};

  Object.values(SERVICE_MAINTENANCE_TYPES).forEach(category => {
    category.subSections.forEach(sub => {
      maintenanceLabelMap[sub.value] = sub.label;
    });
  });


  try {
    await sendEmail({
      to: sendTo,
      type: EmailTypeConst.AUTO_CARE,
      data: {
        ...serviceMailDetails,
        statusMap,
        legend,
        maintenanceLabelMap
      },
      subject: `Service Summary for ${serviceMailDetails.licensePlate}`,
      html: true,
      templateName: "service"  // TODO: constant or env??
    });
  } catch (err) {
    logger.warn('Failed to send repair notification email:', err);
  }
};

/* export const testEmailGeneration = async (serviceID: number) => {
  const service = await prisma.service.findUnique({
    where: { serviceID },
    include: {
      attachments: true,
    },
  });

  if (!service) {
    throw new Error(`Service with ID ${serviceID} not found.`);
  }

  const customer = await prisma.customer.findUnique({
    where: { customerID: service.customerID },
    select: { email: true },
  });

  if (!customer?.email) {
    logger.warn(`No email found for customerID: ${service.customerID}`);
    return;
  }

  const emailHTMLContent = await prepareHTMLContentForService({
    ...service,
    maintenance: service.maintenance ?? [],
  } as Service);

  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

  console.log(emailHTMLContent)

  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

  if (!emailHTMLContent) {
    logger.warn(`Failed to generate email content for service ID: ${serviceID}`);
    return;
  }

  await notifyServiceCreation(customer.email, emailHTMLContent);

  logger.info(`✅ Test email sent successfully for service ID: ${serviceID}`);
}; */