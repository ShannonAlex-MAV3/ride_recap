export interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
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
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export type AutoCareMetric = {
  metric: string;
  value: number;
  nextService?: number;
}

export interface Customer {
  customerID: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  vehicles?: Vehicle[]
}

export interface Vehicle {
  vehicleID: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string;
  status: string;
}

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