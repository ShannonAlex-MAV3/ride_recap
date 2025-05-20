import { z } from "zod";
import { API_URLS } from "@/api";
import apiService from "@/services/api-service";

// all the functions that are used in job-config
export interface JobConfig {
  jobID: number;
  jobCode: string;
  jobName: string;
  description: string;
  category: JobCategories;
  status: string;
}

export enum JobCategories {
  GM = "General Maintenance",
  ID = "Inspections and Diagnostics",
  ER = "Engine Repair & Maintenance",
  BS = "Brakes and Suspension",
  TS = "Transmission Services",
  AC = "HVAC (Heating, Ventilation, Air Conditioning)",
  BP = "Body and Paintwork",
  TW = "Tires and Wheels",
}

export const fetchJobConfig = async (): Promise<JobConfig[]> => {
  const response = await apiService.get(API_URLS.getAllJobConfigs,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Fetching Job Configurations...',
        },
        error: {
          message: 'Failed to fetch Job Configurations',
        }
      }
    })
  return response;
};

export const formSchema = z.object({
  //ToDo: understand
  jobCode: z.string().nullable().optional(),
  jobName: z.string().min(2).max(50),
  description: z.string().min(2).max(255),
  category: z.enum(["GM", "ID", "ER", "BS", "TS", "AC", "BP", "TW"], {
    errorMap: () => ({ message: "Please select a job category" }),
  }),
  status: z.enum(["ACT", "INA"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
});

export const createJob = async (formVals: any) => {

  const response = await apiService.post(
    API_URLS.saveJobConfig,
    formVals,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Creating Job Configuration...',
        },
        success: {
          message: 'Job Configuration created Successfully.',
        },
      }
    })
  return response;
};

export const updateJob = async (formVals: any) => {
  const response = await apiService.put(API_URLS.updateJobConfig, formVals,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Updating Job Configuration...',
        },
        success: {
          message: 'Job Configuration updated Successfully.',
        },
      }
    })
  return response;
};

export const getCategoryEnumValue = (category: string) => {
  return JobCategories[category as keyof typeof JobCategories];
};
