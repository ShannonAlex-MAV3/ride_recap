import logger from "../logger";
import * as dashboardService from "../services/dashboard/service";
import { Request, Response } from "express";

export const getTotalCustomers = async (req: Request, res: Response) => {

    logger.info("Start: get total customers for dashboard.");

    try {
        const response = await dashboardService.getTotalCustomers();

        res.json(response);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

    }

    logger.info("End: get total customers for dashboard.");

};

export const getTotalVehicles = async (req: Request, res: Response) => {

    logger.info("Start: get total vehicles for dashboard.");

    try {
        const response = await dashboardService.getTotalVehicles();

        res.json(response);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

    }

    logger.info("End: get total vehicles for dashboard.");

};

export const getMaintenanceTrend = async (req: Request, res: Response) => {

    logger.info("Start: get maintenance job trend for dashboard.");

    try {
        const response = await dashboardService.getMaintenanceTrend();

        res.json(response);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

    }

    logger.info("End: get maintenance job trend for dashboard.");

};