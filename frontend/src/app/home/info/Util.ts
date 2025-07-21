import { API_URLS } from "@/api";
import apiService from "@/services/api-service";

export interface TotalCustomerDSB {
  totalCustomers: number;
  totalCustomersForCurrentMonth: number;
}

export interface TotalVehicleDSB {
  totalVehicles: number;
  totalVehiclesForCurrentMonth: number;
}

export interface MaintenanceTrendingJobsDSB {
  name: string;
  value: number;
}

export interface LatestRepairsDSB {
  repairID: number
  repairCode: string;
  jobCode: string;
  jobName: string;
  firstName: string;
  lastName: string;
  licensePlate: string;
}

export interface RepairsByJobs {
  category: string;
  count: number
}

export const fetchTotalCustomersForDSB = async (): Promise<TotalCustomerDSB> => {
  const response = await apiService.get(API_URLS.getTotalCustomersForDSB,
    {
      toast: {
        enabled: true,
        error: {
          message: 'Failed to  fetch Total Customers Info.',
        }
      }
    })
  return response;
};

export const fetchTotalVehiclesForDSB = async (): Promise<TotalVehicleDSB> => {
  const response = await apiService.get(API_URLS.getTotalVehiclesForDSB,
    {
      toast: {
        enabled: true,
        error: {
          message: 'Failed to  fetch Total Vehicles Info.',
        }
      }
    })
  return response;
};

export const fetchTrendingJobsForDSB = async (): Promise<MaintenanceTrendingJobsDSB[]> => {
  const response = await apiService.get(API_URLS.getTrendingJobsForDSB,
    {
      toast: {
        enabled: true,
        error: {
          message: 'Failed to  fetch Maintenance Job Trend Info.',
        }
      }
    })
  return response;
};

export const fetchLatestRepairsForDSB = async (): Promise<LatestRepairsDSB[]> => {
  const response = await apiService.get(API_URLS.getLatestRepairsForDSB,
    {
      toast: {
        enabled: true,
        error: {
          message: 'Failed to fetch Latest Repair Info.',
        }
      }
    })
  return response;
}

export const fetchJobWiseRepairsForDSB = async (): Promise<RepairsByJobs[]> => {
  const response = await apiService.get(API_URLS.getJobWiseRepairsForDSB,
    {
      toast: {
        enabled: true,
        error: {
          message: 'Failed to fetch job wise repair Info.',
        }
      }
    })
  return response;
}
