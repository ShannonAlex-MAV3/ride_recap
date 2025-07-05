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

export interface Repair {
  repairID?: number;
  repairCode?: string;
  customerID: number;
  vehicleID: number;
  jobID: number;
  currentMileage: number;
  total?: number;
  mechanicID: number;
  attachments?: File[];
  attachmentRefs?: string[];
  status: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface JobConfig {
  jobID: number;
  jobCode: string;
  jobName: string;
  description: string;
  category: JobCategories;
  status: string;
}

export interface Mechanic {
  mechanicID: number;
  nic: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  mechanicType: MechanicType;
  status: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export enum MechanicType {
  MM = "Main Mechanic",
  SM = 'Secondary Mechanic'
}

export type RepairWithDetails = {
  repairID: number;
  repairCode: string;
  customerID: number;
  firstName: string;
  lastName: string;
  customerCode: string;
  vehicleID: number;
  licensePlate: string;
  jobID: number;
  jobCode: string;
  jobName: string;
  currentMileage: number;
  mechanicID: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date | null;
}


export type Service = {
  serviceID?: number;
  serviceCode?: string;
  customerID: number;
  vehicleID: number;
  jobID: number;
  currentMileage: number;
  serviceDate: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  maintenance: any;
  mechanicID?: number;
  attachments?: File[];
  attachmentRefs?: string[];
  total?: number | null;
  nextInterimService?: number;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export type ServiceWithDetails = {
  serviceID?: number;
  serviceCode?: string;
  customerID: number;
  firstName: string;
  lastName: string;
  vehicleID: number;
  licensePlate: string;
  make: string;
  model: string;
  jobName?: string;
  currentMileage: number;
  serviceDate: string;
  mechanicID?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
}