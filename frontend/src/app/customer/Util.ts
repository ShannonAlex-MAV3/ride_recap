import { API_URLS } from "@/api";
import axios from "axios";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import apiService from "@/services/api-service";

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

export const customerFormSchema = z.object({
  customerCode: z.string().nullable().optional(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().min(2).max(150),
  phone: z.string().min(2).max(50),
  address: z.string().min(2).max(255),
  status: z.enum(["ACT", "INA"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
});

export const vehicleFormSchema = z.object({
  licensePlate: z.string().min(2),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  color: z.string().min(1),
  status: z.enum(["ACT", "INA"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
});

export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await apiService.get(
    `/customers`,
    {
        toast: {
            enabled: true,
            loading: {
              message: 'Fetching Customers...',
            },
            error: {
              message: 'Failed to fetch Customers',
            }
        }
    })
  return response;
};

export const getCustomerByID = async (customerID: number): Promise<Customer | null> => {
  try {
    const response = await axios.get(API_URLS.getJCustomerById(customerID));
    return response.data as Customer;
  } catch (error) {
    console.error("Error fetching customers:", error);
    const message =
      error.response?.data?.message || "Something went wrong while fetching the customer.";
    toast({
      description: message,
      variant: "destructive",
    });
    return null;
  }
};

export const createCustomer = async (formVals: any) => {

  const response = await apiService.post(
    API_URLS.saveCustomer,
    formVals,
    {
        toast: {
            enabled: true,
            loading: {
              message: 'Creating Customer...',
            },
            success: {
              message: 'Customer created Successfully',
            },
        }
    })
  return response;

};

export const updateCustomer = async (formVals: any) => {
  try {
    const response = await axios.put(API_URLS.updateCustomer, formVals);
    toast({
      description: "Customer updated successfully.",
      variant: "success",
    });
    const customerData = response.data;
    return customerData;
  } catch (error) {
    console.error("Create customer error:", error);
    const message =
      error.response?.data?.message || "Something went wrong while updating the customer.";
    toast({
      description: message,
      variant: "destructive",
    });
    return null;
  }
};