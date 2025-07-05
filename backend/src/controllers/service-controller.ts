import * as serviceService from "../services/service/service";
import logger from "../logger";
import { Request, Response } from "express";
import { Service } from "../@types";
import { buffer } from "stream/consumers";

export const getAllServices = async (req: Request, res: Response) => {
    logger.info("Start: get all the services");
    try {
        // Extract query parameters
        const { customerIds, vehicleLicensePlate } = req.query;
        
        // Parse customer IDs if provided
        const parsedCustomerIds = customerIds 
            ? Array.isArray(customerIds) 
                ? customerIds.map(id => parseInt(id as string)) 
                : [parseInt(customerIds as string)]
            : undefined;
        
        // Get services with optional filters
        const services = await serviceService.getAllServices(
            parsedCustomerIds, 
            vehicleLicensePlate as string | undefined
        );
        
        res.json(services);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    logger.info("End: get all the services");
}


export const saveService = async (req: Request, res: Response) => {
    logger.info("Start: create new service.");
    try {
        const newService: Service = {
            ...req.body,
            attachments: req.files || [],
        };
        const service = await serviceService.addService(newService);
        res.status(201).json(service);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    logger.info("End: create new service.");
}


export const getServiceById = async (req: Request, res: Response) => {
    logger.info("Start: get service by id: ", req.params.serviceID);
    try {
        const serviceId = parseInt(req.params.serviceID, 10);
        if (isNaN(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        const service = await serviceService.getServiceById(serviceId);
        res.json(service);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    logger.info("End: get service by id.");
}


export const updateService = async (req: Request, res: Response) => {
    logger.info("Start: update service by id: ", req.params.serviceID);
    try {
        const serviceId = parseInt(req.params.serviceID, 10);
        if (isNaN(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        const updatedService: Service = {
            ...req.body,
            attachments: req.files || [],
        };
        const service = await serviceService.updateService(serviceId, updatedService);
        res.json(service);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    logger.info("End: update service by id.");
}

/* export const testServiceEmail = async (req: Request, res: Response) => {

    try {
        const serviceId = parseInt(req.params.serviceID, 10);
        if (isNaN(serviceId)) {
            return res.status(400).json({ message: "Invalid service ID" });
        }
        const service = await serviceService.testServiceEmail(serviceId);
        res.json(service);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
}
 */