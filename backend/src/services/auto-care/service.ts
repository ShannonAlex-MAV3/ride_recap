import { AutoCare } from '../../@types';
import logger from '../../logger';
import { generateUniqueAutoCareCode } from './support';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// TODO: Transactional
export const addAutoCare = async (autoCareData: any): Promise<AutoCare> => {
  // TODO: check relational entities status!!
    logger.info("Start: Saving new Auto Care record.");
    // Generate a unique auto care code
      const autoCareCode = await generateUniqueAutoCareCode();
      
      const newAutoCare = await prisma.autoCare.create({
        data: {
          autoCareCode,
          customerID: autoCareData.customerID,
          vehicleID: autoCareData.vehicleID,
          jobID: autoCareData.jobID,
          currentMileage: autoCareData.currentMileage || 0,
          metricConfig: autoCareData.metricConfig,
          mechanic: autoCareData.mechanic || '',
          status: autoCareData.status,
          createdAt: new Date(),
          updatedAt: autoCareData.updatedAt || null,
        },
      });
      logger.info(`Auto Care record created successfully with code: ${autoCareCode}`);
      // Parse or cast the metricConfig to match AutoCare type
      return {
        ...newAutoCare,
        metricConfig: Array.isArray(newAutoCare.metricConfig) 
          ? newAutoCare.metricConfig 
          : []
      } as AutoCare;
}

export const updateAutoCare = async (autoCareID: number, autoCareData: any): Promise<AutoCare> => {
    logger.info(`Start: Updating Auto Care record with ID: ${autoCareID}`);
    
    const updatedAutoCare = await prisma.autoCare.update({
        where: {
            autoCareID,
        },
        data: {
            ...autoCareData,
            updatedAt: new Date(),
        },
    });
    
    logger.info(`Auto Care record with ID ${autoCareID} updated successfully.`);
    
    // Parse or cast the metricConfig to match AutoCare type
    return {
      ...updatedAutoCare,
      metricConfig: Array.isArray(updatedAutoCare.metricConfig) 
        ? updatedAutoCare.metricConfig 
        : []
    } as AutoCare;
}

export const getAutoCareById = async (autoCareID: number): Promise<AutoCare | null> => {
    logger.info(`Start: Fetching Auto Care record by ID: ${autoCareID}`);
    
    const autoCare = await prisma.autoCare.findUnique({
        where: {
            autoCareID,
        },
    });
    
    if (!autoCare) {
        logger.warn(`No Auto Care record found with ID: ${autoCareID}`);
        return null;
    }
    
    logger.info(`Fetched Auto Care record: ${JSON.stringify(autoCare)}`);
    
    // Parse or cast the metricConfig to match AutoCare type
    return {
      ...autoCare,
      metricConfig: Array.isArray(autoCare.metricConfig) 
        ? autoCare.metricConfig 
        : []
    } as AutoCare;
}


export const getAllAutoCares = async (): Promise<AutoCare[]> => {
    logger.info("Start: Fetching all Auto Care records.");
    
    const autoCares = await prisma.autoCare.findMany();
    
    logger.info(`Fetched ${autoCares.length} Auto Care records.`);
    
    // Parse or cast the metricConfig to match AutoCare type
    return autoCares.map(autoCare => ({
      ...autoCare,
      metricConfig: Array.isArray(autoCare.metricConfig) 
        ? autoCare.metricConfig 
        : []
    })) as AutoCare[];
}