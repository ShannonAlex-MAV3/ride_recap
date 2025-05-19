import { Request, Response } from "express";
import * as jobConfigService from "../services/job-config/service";
import { JobConfig } from "../@types";
import logger from "../logger";

export const getAllJobConfigs = async (req: Request, res: Response) => {

  logger.info("Start: get all the job configs.");

  try {
    const jobs = await jobConfigService.getAllJobConfigs();

    res.json(jobs);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

  }

  logger.info("End: get all the job configs.");

};

export const saveJobConfig = async (req: Request, res: Response) => {

  logger.info("Start: create new job config.");

  try {
    const newJob: JobConfig = req.body;
    const job = await jobConfigService.saveJobConfig(newJob);

    res.status(201).json(job);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

  }

  logger.info("End: create new job config.");

};

export const getJobConfigById = async (req: Request, res: Response) => {

  logger.info("Start: get job config  by id: ", req.params.jobId);

  try {
    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await jobConfigService.getJobConfigById(jobId);
    res.json(job);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

  }

  logger.info("End: get job config  by id :", req.params.jobId);

};

export const updateJobConfig = async (req: Request, res: Response) => {

  logger.info("Start: update new job config.");

  try {
    const job: JobConfig = req.body;
    const updatedJob = await jobConfigService.updateJobConfig(job);

    res.status(200).json(updatedJob);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });

  }

  logger.info("End: update new job config.");
};

