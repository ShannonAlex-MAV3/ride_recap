import { JobCategories, JobConfig, Status } from "../../@types";
import { PrismaClient } from "@prisma/client";
import { createJobCode } from "./support";
import logger from "../../logger";

const prisma = new PrismaClient();

/** DO WE NEED: track who made the update or need versioning **/

export const getAllJobConfigs = async (): Promise<JobConfig[]> => {
  logger.info("Start: Fetching all job configurations.");

  const allJobs = await prisma.jobConfig.findMany({
    orderBy: [
      {
        jobID: 'asc',
      },
    ],
  });

  logger.info(`End: Fetched ${allJobs.length} job configurations.`);

  return allJobs;
};

export const saveJobConfig = async (job: JobConfig): Promise<JobConfig> => {
  logger.info("Start: Saving new job configuration.");

  // Be cautious of potential concurrency issues. If multiple records are being created simultaneously, this approach could lead to duplicate job codes.
  const latestJob = await getLatestJob();

  const latestID = latestJob?.jobID || 0;

  const newJobCode = createJobCode(latestID);
  logger.info(`Generated job code: ${newJobCode}`);

  const newJob = {
    jobCode: newJobCode,
    jobName: job.jobName,
    description: job.description,
    category: job.category,
    status: job.status,
  };

  const savedJob = await prisma.jobConfig.create({ data: newJob });

  logger.info("End: Saved new job configuration.", savedJob);

  return savedJob;
};

export const getLatestJob = async (): Promise<JobConfig | null> => {
  logger.info("Start: Fetching latest job configuration.");

  const latestJob = await prisma.jobConfig.findFirst({
    orderBy: { jobID: "desc" },
  });

  logger.info("End: Fetched latest job configuration.", latestJob);

  return latestJob;
};

export const getJobConfigById = async (
  jobId: number
): Promise<JobConfig | null> => {
  logger.info(`Start: Fetching job configuration by ID: ${jobId}`);

  const job = await prisma.jobConfig.findUnique({
    where: {
      jobID: jobId,
    },
  });

  logger.info(`End: Fetched job configuration: ${job}`);

  return job;
};

export const updateJobConfig = async (job: JobConfig): Promise<JobConfig> => {
  logger.info("Start: Updating job configuration.");

  const updatedJob = await prisma.jobConfig.update({
    where: {
      jobID: job.jobID,
    },
    data: { ...job, updatedAt: new Date(), },
  });

  logger.info("End: Update job configuration for ", updatedJob.jobCode);

  return updatedJob;
};
