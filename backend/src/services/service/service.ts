import { url } from 'inspector';
import { Service, ServiceWithDetails } from '../../@types';
import logger from '../../logger';
import { getS3Service } from '../storage/storage';
import { generateUniqueServiceCode, prepareHTMLContentForService, notifyServiceCreation } from './support';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO: Transactional
export const addService = async (serviceData: any) => {
    logger.info("Start: Saving new Service record.");
    const s3 = getS3Service();
    const attachments = [];
    if (serviceData.attachments || serviceData.attachments.length !== 0) {
        for (const attachment of serviceData.attachments) {
            const savedFile = await s3.uploadData(attachment);
            attachments.push({
                fileID: savedFile.id,
                reference: savedFile.reference,
            });
        }
    }

    // Generate a unique service code
    const serviceCode = await generateUniqueServiceCode();
    const newService = await prisma.service.create({
        data: {
            serviceCode,
            customerID: parseInt(serviceData.customerID),
            vehicleID: parseInt(serviceData.vehicleID),
            currentMileage: parseInt(serviceData.currentMileage) || 0,
            serviceDate: new Date(serviceData.serviceDate),
            maintenance: JSON.parse(serviceData.maintenance),
            mechanicID: parseInt(serviceData.mechanicID),
            status: serviceData.status,
            createdAt: new Date(),
            updatedAt: serviceData.updatedAt || null,
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

    // Move to a helper method
    const customer = await prisma.customer.findUnique({
        where: { customerID: newService.customerID },
        select: { email: true },
    });

    if (customer?.email) {
        const emailHTMLContent = await prepareHTMLContentForService({
            ...newService,
            maintenance: newService.maintenance ?? [],
        } as Service);

        if (emailHTMLContent) {
            await notifyServiceCreation(customer.email, emailHTMLContent);
        } else {
            logger.warn(`Failed to prepare HTML content for Service: ${newService.serviceCode}`);
        }
    } else {
        logger.warn(`No email found for customerID: ${newService.customerID}`);
    }

    logger.info(`Service record created successfully with code: ${serviceCode}`);

    return {
        ...newService,
        attachments: [],
        attachmentRefs,
    } as Service;
}


export const updateService = async (serviceID: number, serviceData: any): Promise<Service> => {
    logger.info(`Start: Updating Service record with ID: ${serviceID}`);
    const s3 = getS3Service();

    // Fetch existing service attachments
    const existingService = await prisma.service.findUnique({
        where: { serviceID },
        include: {
            attachments: {
                where: { status: 'ACT' }
            }
        }
    });

    if (!existingService) {
        logger.error(`Service with ID ${serviceID} not found`);
        throw new Error(`Service with ID ${serviceID} not found`);
    }

    const newAttachments: { fileID: any; reference: any; }[] = [];
    for (const attachment of serviceData.attachments) {
        const savedFile = await s3.uploadData(attachment);
        newAttachments.push({
            fileID: savedFile.id,
            reference: savedFile.reference,
        });
    }

    // const newAttachmentRefs = newAttachments.map(att => att.reference);

    const updatedService = await prisma.$transaction(async (prismaClient) => {
        // Mark attachments that are not in the attachmenRefs in serviceData as inactive
        if (existingService.attachments.length > 0) {
            const referencesToKeep = serviceData.attachmentsRefs ? JSON.parse(serviceData.attachmentsRefs) : [];

            const attachmentsToInactivate = existingService.attachments.filter(
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
                        prismaClient.serviceAttachment.update({
                            where: {
                                serviceID_fileID_reference: {
                                    serviceID: serviceID,
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
                    prismaClient.serviceAttachment.create({
                        data: {
                            serviceID,
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
        const updated = await prismaClient.service.update({
            where: { serviceID },
            data: {
                currentMileage: parseInt(serviceData.currentMileage) || 0,
                maintenance: JSON.parse(serviceData.maintenance),
                status: serviceData.status,
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
        updatedService.attachments.map(async (att) => {
            const url = await s3.getPresignedUrl(att.reference);
            logger.info(`Generated presigned URL for attachment: ${att.reference}`);
            return url;
        })
    );

    logger.info(`Service record with ID ${serviceID} updated successfully.`);
    return {
        ...updatedService,
        attachmentRefs,
        attachments: [],
    } as Service;
}


export const getServiceById = async (serviceID: number): Promise<Service | null> => {
    logger.info(`Start: Fetching Service record by ID: ${serviceID}`);
    const s3 = getS3Service();
    const service = await prisma.service.findUnique({
        where: {
            serviceID,
        },
        include: {
            attachments: {
                where: {
                    status: 'ACT'
                }
            },
        },
    });

    if (!service) {
        logger.warn(`No Service record found with ID: ${serviceID}`);
        return null;
    }

    // Generate presigned URLs for all attachments
    const attachmentRefs = await Promise.all(
        service.attachments.map(async (att) => {
            const url = await s3.getPresignedUrl(att.reference);
            logger.info(`Generated presigned URL for attachment: ${att.reference}`);
            return url;
        })
    );

    logger.info(`Fetched Service record: ${JSON.stringify(service)}`);
    return {
        ...service,
        attachments: [],
        attachmentRefs
    } as Service;
}



export const getAllServices = async (customerIds?: number[], vehicleLicensePlate?: string): Promise<ServiceWithDetails[]> => {
    logger.info("Start: Fetching all Service records with details.");
    logger.info(`Filters - customerIds: ${customerIds}, vehicleLicensePlate: ${vehicleLicensePlate}`);

    // Build the SQL query with potential filters
    let sql = `
        SELECT 
            s.*, 
            c."firstName", 
            c."lastName", 
            c."customerCode",
            v."licensePlate",
            v."make",
            v."model"
        FROM 
            "Service" s
        INNER JOIN 
            "Customer" c ON s."customerID" = c."customerID"
        INNER JOIN 
            "Vehicle" v ON s."vehicleID" = v."vehicleID"
        WHERE 1=1
    `;

    const params: any[] = [];

    // Add customerIds filter if provided
    if (customerIds && customerIds.length > 0) {
        sql += ` AND s."customerID" IN (${customerIds.map((_, i) => `$${i + 1}`).join(',')})`;
        params.push(...customerIds);
    }

    // Add vehicle license plate filter if provided
    if (vehicleLicensePlate) {
        sql += ` AND v."licensePlate" ILIKE $${params.length + 1}`;
        params.push(`%${vehicleLicensePlate}%`);
    }

    sql += ` ORDER BY s."serviceID" DESC`;

    // Execute the query with parameters
    const services = await prisma.$queryRawUnsafe(sql, ...params);

    // Group services and their attachments
    const serviceMap = new Map();

    // Process raw results and group by serviceID
    for (const row of services as any[]) {
        if (!serviceMap.has(row.serviceID)) {
            serviceMap.set(row.serviceID, {
                ...row,
            });
        }
    }

    const result = Array.from(serviceMap.values());
    logger.info(`Fetched ${result.length} Service records with details.`);
    return result as ServiceWithDetails[];
}

/* export const testServiceEmail = async (serviceID: number) => {
    logger.info(`Start: email testing for service: ${serviceID}`);


    await testEmailGeneration(serviceID);

    logger.info(`End: email testing for service: ${serviceID}`);
} */
