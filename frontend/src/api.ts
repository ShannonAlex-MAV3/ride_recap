export const BASE_URL = "http://localhost:5000/api";

export const API_URLS = {
    // Job-Config URLS
    getAllJobConfigs: `/job-configs`,
    saveJobConfig: `${BASE_URL}/job-configs/save`,
    updateJobConfig: `${BASE_URL}/job-configs/update`,

    // Customer URLS
    getAllCustomers: `/customers`,
    saveCustomer: `/customers/save`,
    updateCustomer: `${BASE_URL}/customers/update`,
    getJCustomerById: (customerID: number) => `${BASE_URL}/customers/${customerID}`,

    // Dashboard URLS
    getTotalCustomersForDSB: `/dashboard/getTotalCustomers`,
    getTotalVehiclesForDSB: `/dashboard/getTotalVehicles`,
    getTrendingJobsForDSB: `/dashboard/getMaintenanceTrend`,
    getVehiclesByCustomerId: (customerID: number) => `/customers/${customerID}/vehicles`,

    // AutoCare URLS
    getAllAutoCares: `/auto-cares`,
    addAutoCare: `/auto-cares/save`,
    updateAutoCare: (autocareID: number) => `/auto-cares/update/${autocareID}`,
    getAutoCareById: (autoCareID: number) => `/auto-cares/${autoCareID}`,
}