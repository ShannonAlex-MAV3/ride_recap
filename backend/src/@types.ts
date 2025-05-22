import { JobCategoriesP, MechanicType, StatusP } from "@prisma/client";

// Add backend types
export interface JobConfig {
  jobID?: number;
  jobCode?: string;
  jobName: string;
  description: string;
  category: JobCategoriesP;
  status: StatusP;
  createdAt?: Date;
  updatedAt?: Date | null;
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

export interface Customer { // TODO update
  customerID?: number;
  customerCode?: string;
  firstName: string;
  lastName: string; // can last name be null?
  email: string;
  phone: string;
  address: string;
  status: StatusP;
  createdAt?: Date;
  updatedAt?: Date | null;
  vehicles?: Vehicle[]
}

export interface Vehicle {
  vehicleID?: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  status: StatusP;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type AutoCare = {
  autoCareID?: number;
  autoCareCode?: string;
  customerID: number;
  vehicleID: number;
  jobID: number;
  currentMileage: number;
  metricConfig: AutoCareMetric[];
  mechanic?: string;
  status?: StatusP;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export type AutoCareMetric = {
  metric: string;
  value: number;
  nextService?: number;
}

export interface Mechanic {
  mechanicID?: number;
  nic: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  mechanicType: MechanicType;
  status: StatusP;
  createdAt?: Date;
  updatedAt?: Date | null;
}