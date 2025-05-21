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