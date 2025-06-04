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
    getSpecificVehicleOfCustomer: (customerID: number, vehicleID: number) => `/customers/${customerID}/vehicles/${vehicleID}`,

    // Dashboard URLS
    getTotalCustomersForDSB: `/dashboard/getTotalCustomers`,
    getTotalVehiclesForDSB: `/dashboard/getTotalVehicles`,
    getTrendingJobsForDSB: `/dashboard/getMaintenanceTrend`,
    getVehiclesByCustomerId: (customerID: number) => `/customers/${customerID}/vehicles`,

    // AutoCare URLS
    // getAllAutoCares: `/auto-cares`,
    // addAutoCare: `/auto-cares/save`,
    // updateAutoCare: (autocareID: number) => `/auto-cares/update/${autocareID}`,
    // getAutoCareById: (autoCareID: number) => `/auto-cares/${autoCareID}`,

    // Repair URLS
    getAllRepairs: `/repair`,
    getAllRepairsWithDetails: `/repair/getAllRepairsWithDetails`,
    addRepair: `/repair/save`,
    updateRepair: `/repair/update`,
    getRepairById: (repairID: number) => `/repair/${repairID}`,

    // Mechanic URLS
    getAllMechanics: '/mechanic',

    // Service API's
    SERVICE: {
        getAllServices: `/service`,
        addService: `/service/save`,
        updateService: (serviceID: number) => `/service/update/${serviceID}`,
        getServiceById: (serviceID: number) => `/service/${serviceID}`,
    }
}