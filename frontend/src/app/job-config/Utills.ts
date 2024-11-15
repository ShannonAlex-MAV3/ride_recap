import { z } from "zod";
import axios from "axios";
import { API_URLS } from "@/api";
import { useNavigate } from "react-router-dom";

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

export enum Status {
  ACT = "Active",
  INA = "Inactive",
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
  category: z.string().min(2).max(50),
  status: z.string().min(2).max(50),
});

export const createJob = async (formVals: any) => {
  
  console.log("createJob Form vals: ", formVals);
    // try {
      

    // } catch (error) {
    //   console.error("Error creating job configurations:", error);
    //   return [];
    // }

    const response = await axios.post(API_URLS.saveJobConfig, formVals);
      // return response.data as JobConfig[];

    const jobData = response.data;
    console.log("Job created successfully:", jobData);
    return response;
      
      // Assuming `jobID` is returned in `jobData`
      // navigate(`/job-config/${jobData.jobID}`);
};

export const updateJob = (formVals: any) => {
  console.log("updateJob Form vals: ", formVals);
};

export const getCategoryEnumValue = (category: string) => {
  return JobCategories[category as keyof typeof JobCategories];
};

export const getStatusEnumValue = (status: string) => {
  return Status[status as keyof typeof Status];
};

// export const handleRowClick = (jobCode: string) => {
//   console.log("HandleRowClick: jobCode -->", jobCode);
//   //   const navigate = useNavigate();
//   //   navigate(`/jobs/${jobCode}`); // Navigate to the Job Detail page
// };
