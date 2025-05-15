import { JobCategoriesP, StatusP } from "@prisma/client";

// Add backend types
export interface JobConfig {
  jobID?: number;
  jobCode?: string;
  jobName: string;
  description: string;
  category: JobCategoriesP;
  status: StatusP;
  createdAt?: Date; 
  updatedAt?: Date;
}

export const JobCategories: any = {
    [JobCategoriesP.GM]: "General Maintenance",
    [JobCategoriesP.ID]: "Inspections and Diagnostics",
    [JobCategoriesP.ER]: "Engine Repair & Maintenance",
    [JobCategoriesP.BS]: "Brakes and Suspension",
    [JobCategoriesP.TS]: "Transmission Services",
    [JobCategoriesP.AC]: "HVAC (Heating, Ventilation, Air Conditioning)",
    [JobCategoriesP.BP]: "Body and Paintwork",
    [JobCategoriesP.TW]: "Tires and Wheels",
}

export const Status: any = {
  [StatusP.ACT]: "Active",
  [StatusP.INA]: "Inactive",
}
