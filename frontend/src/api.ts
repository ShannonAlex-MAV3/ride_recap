export const BASE_URL = "/api";

export const API_URLS = {
    // Job-Config URLS
    getAllJobConfigs: `${BASE_URL}/job-configs`,
    saveJobConfig: `${BASE_URL}/job-configs/save`,
    updateJobConfig: `${BASE_URL}/job-configs/update`,

    // Customer URLS
    getAllCustomers: `${BASE_URL}/customers`,
    saveCustomer: `${BASE_URL}/customers/save`,
    updateCustomer: `${BASE_URL}/customers/update`,
    getJCustomerById: (customerID: number) => `${BASE_URL}/customers/${customerID}`,
    getSpecificVehicleOfCustomer: (customerID: number, vehicleID: number) => `${BASE_URL}/customers/${customerID}/vehicles/${vehicleID}`,

    // Dashboard URLS
    getTotalCustomersForDSB: `${BASE_URL}/dashboard/getTotalCustomers`,
    getTotalVehiclesForDSB: `${BASE_URL}/dashboard/getTotalVehicles`,
    getTrendingJobsForDSB: `${BASE_URL}/dashboard/getMaintenanceTrend`,
    getVehiclesByCustomerId: (customerID: number) => `${BASE_URL}/customers/${customerID}/vehicles`,

    // Repair URLS
    getAllRepairs: `${BASE_URL}/repair`,
    getAllRepairsWithDetails: `${BASE_URL}/repair/getAllRepairsWithDetails`,
    addRepair: `${BASE_URL}/repair/save`,
    updateRepair: (repairID: number) => `${BASE_URL}/repair/update/${repairID}`,
    getRepairById: (repairID: number) => `${BASE_URL}/repair/${repairID}`,

    // Mechanic URLS
    getAllMechanics: `${BASE_URL}/mechanic`,

    // Service API's
    SERVICE: {
        getAllServices: `${BASE_URL}/service`,
        addService: `${BASE_URL}/service/save`,
        updateService: (serviceID: number) => `${BASE_URL}/service/update/${serviceID}`,
        getServiceById: (serviceID: number) => `${BASE_URL}/service/${serviceID}`,
    }
}