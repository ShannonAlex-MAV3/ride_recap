import logger from "../logger";
import { Request, Response } from "express";
import * as mechanicService from "../services/mechanic/service";


export const getAllMechanics = async (req: Request, res: Response) => {

  logger.info("Start: get all mechanics");

  try {
    const mechanics = await mechanicService.getAllMechanics();

    res.json(mechanics);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: get all mechanics");

};