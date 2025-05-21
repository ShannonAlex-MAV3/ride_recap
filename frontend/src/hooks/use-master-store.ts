// filepath: d:\Projects\ride_recap\frontend\src\hooks\use-master-store.ts
import { create } from 'zustand';
import axios from 'axios';
import { API_URLS, BASE_URL } from '@/api';
import { Customer, JobConfig } from "@/@types";

// Define the state interface
interface MasterState {
  // Data
  customers: Customer[];
  jobs: JobConfig[];

  // Loading states
  isLoadingCustomers: boolean;
  isLoadingJobs: boolean;

  // Error states
  customersError: string | null;
  jobsError: string | null;

  // Actions
  fetchCustomers: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  getCustomerById: (id: number) => Customer | undefined;
  getJobById: (id: number) => JobConfig | undefined;
  resetErrors: () => void;
}

// Create the store
export const useMasterStore = create<MasterState>((set, get) => ({
  // Initial state
  customers: [],
  jobs: [],
  isLoadingCustomers: false,
  isLoadingJobs: false,
  customersError: null,
  jobsError: null,

  // Actions
  fetchCustomers: async () => {
    set({ isLoadingCustomers: true, customersError: null });

    try {
      const response = await axios.get(`${BASE_URL}${API_URLS.getAllCustomers}`);
      set({ customers: response.data, isLoadingCustomers: false });
    } catch (error) {
      set({
        customersError: error instanceof Error ? error.message : 'Failed to fetch customers',
        isLoadingCustomers: false
      });
    }
  },

  fetchJobs: async () => {
    set({ isLoadingJobs: true, jobsError: null });

    try {
      const response = await axios.get(`${BASE_URL}${API_URLS.getAllJobConfigs}`);
      set({ jobs: response.data, isLoadingJobs: false });
    } catch (error) {
      set({
        jobsError: error instanceof Error ? error.message : 'Failed to fetch jobs',
        isLoadingJobs: false
      });
    }
  },

  getCustomerById: (id: number) => {
    return get().customers.find(customer => customer.customerID === id);
  },

  getJobById: (id: number) => {
    return get().jobs.find(job => job.jobID === id);
  },

  resetErrors: () => {
    set({ customersError: null, jobsError: null });
  }
}));

// Export a hook to initialize data on app startup
export const useInitializeMasterData = () => {
  const { fetchCustomers, fetchJobs } = useMasterStore();

  const initialize = async () => {
    await Promise.all([
      fetchCustomers(),
      fetchJobs()
    ]);
  };

  return { initialize };
};