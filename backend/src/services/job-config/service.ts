import { JobCategories, JobConfig, Status } from "../../@types";
import { PrismaClient } from "@prisma/client";
import { createJobCode } from "./support";

const prisma = new PrismaClient();

export const getAllJobConfigs = async (): Promise<JobConfig[]> => {
  console.log("Start: Fetching all job configurations.");

  const allJobs = await prisma.jobConfig.findMany();

  console.log(`End: Fetched ${allJobs.length} job configurations.`);

  return allJobs;
};

// ToDo: created@, updated@
export const saveJobConfig = async (job: JobConfig): Promise<JobConfig> => {
  console.log("Start: Saving new job configuration.");

  // Be cautious of potential concurrency issues. If multiple records are being created simultaneously, this approach could lead to duplicate job codes.
  const latestJob = await getLatestJob();

  const latestID = latestJob?.jobID || 0;

  const newJobCode = createJobCode(latestID);
  console.log(`Generated job code: ${newJobCode}`);

  const newJob = {
    jobCode: newJobCode,
    jobName: job.jobName,
    description: job.description,
    category: job.category,
    status: job.status,
  };

  const savedJob = await prisma.jobConfig.create({ data: newJob });

  console.log("End: Saved new job configuration.", savedJob);

  return savedJob;
};

export const getLatestJob = async (): Promise<JobConfig | null> => {
  console.log("Start: Fetching latest job configuration.");

  const latestJob = await prisma.jobConfig.findFirst({
    orderBy: { jobID: "desc" },
  });

  console.log("End: Fetched latest job configuration.", latestJob);

  return latestJob;
};

export const getJobConfigById = async (
  jobId: number
): Promise<JobConfig | null> => {
  console.log(`Start: Fetching job configuration by ID: ${jobId}`);

  const job = await prisma.jobConfig.findUnique({
    where: {
      jobID: jobId,
    },
  });

  console.log(`End: Fetched job configuration: ${job}`);

  return job;
};

export const updateJobConfig = async (job: JobConfig): Promise<JobConfig> => {
  console.log("Start: Update job configuration.");

  const updatedJob = await prisma.jobConfig.update({
    where: {
      jobID: job.jobID,
    },
    data: job,
  });

  console.log("End: Update job configuration for ", updatedJob.jobCode);

  return updatedJob;
};
