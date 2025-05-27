import { Repair } from "../@types";
import logger from "../logger";
import * as repairService from "../services/repair/service"
import { Request, Response } from "express";

export const getAllRepairs = async (req: Request, res: Response) => {
    logger.info("Start: get all the repairs");

    try {
        const repairs = await repairService.getAllRepairs();

        res.json(repairs);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }

    logger.info("End: get all the repairs");
}

export const saveRepair = async (req: Request, res: Response) => {
    logger.info("Start: create new repair.");

    try {
        const newRepair: Repair = req.body;
        const repair = await repairService.addRepair(newRepair);

        res.status(201).json(repair); // TODO:Add this to other save calls
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }

    logger.info("End: create new repair.");
}

export const getRepairById = async (req: Request, res: Response) => {
    logger.info("Start: get repair by id: ", req.params.repairID);

    try {
        const repairId = parseInt(req.params.repairID, 10); // TODO:Add this to other get calls
        if (isNaN(repairId)) {
            return res.status(400).json({ message: "Invalid repair ID" });
        }

        const repair = await repairService.getRepairById(repairId);
        res.json(repair);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }

    logger.info("End: get repair by id.");
}

export const updateRepair = async (req: Request, res: Response) => {
    logger.info("Start: update repair by id: ", req.params.repairID);

    try {
        const repairId = parseInt(req.params.repairID, 10);
        if (isNaN(repairId)) {
            return res.status(400).json({ message: "Invalid repair ID" });
        }

        const updatedRepair: Repair = req.body;
        const repair = await repairService.updateRepair(repairId, updatedRepair);
        res.json(repair);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }

    logger.info("End: update repair by id.");
}

export const getAllRepairsWithDetails = async (req: Request, res: Response) => {
    logger.info("Start: get all the repairs with other details");

    try {
        const repairs = await repairService.getAllRepairsWithRelationDetails();

        res.json(repairs);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }

    logger.info("End: get all the repairs with other details");
}

