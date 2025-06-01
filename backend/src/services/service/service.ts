import { url } from 'inspector';
import { Service, ServiceWithDetails } from '../../@types';
import logger from '../../logger';
import { getS3Service } from '../storage/storage';
import { generateUniqueServiceCode } from './support';
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
            jobID: parseInt(serviceData.jobID),
            currentMileage: parseInt(serviceData.currentMileage) || 0,
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
    logger.info(`Service record created successfully with code: ${serviceCode}`);
    return {
        ...newService,
        attachments: [],
        attachmentRefs: attachments.map(att => att.reference),
    } as Service;
}


export const updateService = async (serviceID: number, serviceData: any): Promise<Service> => {
    logger.info(`Start: Updating Service record with ID: ${serviceID}`);
    const s3 = getS3Service();

    // Fetch existing service attachments
    const existingService = await prisma.service.findUnique({
        where: { serviceID },
        include: { attachments: true }
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

    const newAttachmentRefs = newAttachments.map(att => att.reference);

    const updatedService = await prisma.$transaction(async (prismaClient) => {
        // Mark attachments that are not in the new list as inactive
        if (existingService.attachments.length > 0) {
            for (const attachment of existingService.attachments) {
                if (!newAttachmentRefs.includes(attachment.reference) && attachment.status === 'ACT') {
                    await prismaClient.serviceAttachment.update({
                        where: {
                            serviceID_fileID_reference: {
                                serviceID,
                                fileID: attachment.fileID,
                                reference: attachment.reference
                            }
                        },
                        data: {
                            status: 'INA',
                            updatedAt: new Date()
                        }
                    });
                    logger.info(`Attachment with reference ${attachment.reference} marked as inactive`);
                }
            }
        }

        // Add new attachments
        for (const attachment of newAttachments) {
            await prismaClient.serviceAttachment.create({
                data: {
                    serviceID,
                    fileID: attachment.fileID,
                    reference: attachment.reference,
                    status: 'ACT',
                    createdAt: new Date()
                }
            });
            logger.info(`New attachment with reference ${attachment.reference} added`);
        }

        // Update the service record
        const updated = await prismaClient.service.update({
            where: { serviceID },
            data: {
                ...serviceData,
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

    logger.info(`Service record with ID ${serviceID} updated successfully.`);
    return {
        ...updatedService,
        attachmentRefs: updatedService.attachments.map(att => att.reference)
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
            attachments: true,
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



export const getAllServices = async (): Promise<ServiceWithDetails[]> => {
    logger.info("Start: Fetching all Service records with details.");

    // Using raw SQL for optimized joins to get all necessary data in a single query
    const services = await prisma.$queryRaw`
        SELECT 
            s.*, 
            c."firstName", 
            c."lastName", 
            c."customerCode",
            v."licensePlate",
            v."make",
            v."model",
            j."jobCode",
            j."jobName"
        FROM 
            "Service" s
        INNER JOIN 
            "Customer" c ON s."customerID" = c."customerID"
        INNER JOIN 
            "Vehicle" v ON s."vehicleID" = v."vehicleID"
        INNER JOIN 
            "JobConfig" j ON s."jobID" = j."jobID"
        ORDER BY 
            s."serviceID" DESC
    `;

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