import * as autoCareService from "../services/auto-care/service";
import logger from "../logger";
import { Request, Response } from "express";
import { AutoCare } from "../@types";


export const getAllAutoCares = async (req: Request, res: Response) => {
    logger.info("Start: get all the auto cares");
    
    try {
        const autoCares = await autoCareService.getAllAutoCares();
    
        res.json(autoCares);
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        } else {
        res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    
    logger.info("End: get all the auto cares");
}

export const saveAutoCare = async (req: Request, res: Response) => {
    logger.info("Start: create new auto care.");
    
    try {
        const newAutoCare: AutoCare = req.body;
        const autoCare = await autoCareService.addAutoCare(newAutoCare);
    
        res.status(201).json(autoCare);
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        } else {
        res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    
    logger.info("End: create new auto care.");
}

export const getAutoCareById = async (req: Request, res: Response) => {
    logger.info("Start: get auto care by id: ", req.params.autoCareID);
    
    try {
        const autoCareId = parseInt(req.params.autoCareID, 10);
        if (isNaN(autoCareId)) {
        return res.status(400).json({ message: "Invalid auto care ID" });
        }
    
        const autoCare = await autoCareService.getAutoCareById(autoCareId);
        res.json(autoCare);
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        } else {
        res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    
    logger.info("End: get auto care by id.");
}

export const updateAutoCare = async (req: Request, res: Response) => {
    logger.info("Start: update auto care by id: ", req.params.autoCareID);
    
    try {
        const autoCareId = parseInt(req.params.autoCareID, 10);
        if (isNaN(autoCareId)) {
        return res.status(400).json({ message: "Invalid auto care ID" });
        }
    
        const updatedAutoCare: AutoCare = req.body;
        const autoCare = await autoCareService.updateAutoCare(autoCareId, updatedAutoCare);
        res.json(autoCare);
    } catch (error) {
        if (error instanceof Error) {
        res.status(500).json({ message: error.message });
        } else {
        res.status(500).json({ message: "An unknown error occurred" });
        }
        logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
    }
    
    logger.info("End: update auto care by id.");
}