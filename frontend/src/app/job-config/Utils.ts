import { z } from "zod";
import axios from "axios";
import { API_URLS } from "@/api";

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
  try {
    const response = await axios.get(API_URLS.getAllJobConfigs);
    return response.data as JobConfig[];
  } catch (error) {
    console.error("Error fetching job configurations:", error);
    return [];
  }
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

  const response = await axios.post(API_URLS.saveJobConfig, formVals);

  const jobData = response.data;
  return jobData;

  // Assuming `jobID` is returned in `jobData`
  // navigate(`/job-config/${jobData.jobID}`);
};

export const updateJob = async (formVals: any) => {
  console.log("updateJob Form vals: ", formVals);

  const response = await axios.put(API_URLS.updateJobConfig, formVals);

  const jobData = response.data;
  return jobData;
};

export const getCategoryEnumValue = (category: string) => {
  return JobCategories[category as keyof typeof JobCategories];
};

// export const handleRowClick = (jobCode: string) => {
//   console.log("HandleRowClick: jobCode -->", jobCode);
//   //   const navigate = useNavigate();
//   //   navigate(`/jobs/${jobCode}`); // Navigate to the Job Detail page
// };
