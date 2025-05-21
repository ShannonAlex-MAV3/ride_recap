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