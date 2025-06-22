import { Repair, RepairWithDetails } from "@/@types";
import apiService from "@/services/api-service";
import { API_URLS } from "@/api";
import { z } from "zod";

export interface RepairSearchFilters {
    customerIds?: number[];
    vehicleLicensePlate?: string;
}

export const repairFormSchema = z.object({
    repairCode: z.string().nullable().optional(),
    customerId: z.string({
        required_error: "Please select a customer",
    }),
    vehicleId: z.string({
        required_error: "Please select a vehicle",
    }),
    jobId: z.string({
        required_error: "Please select a job",
    }),
    mechanicId: z.string({
        required_error: "Please select a mechanic",
    }),
    currentMileage: z.coerce
        .number({
            required_error: "Please enter current mileage",
            invalid_type_error: "Please enter a valid number",
        })
        .nonnegative("Mileage cannot be negative"),
    total: z.coerce
        .number({
            required_error: "Please enter the total amount",
            invalid_type_error: "Total must be a valid number",
        })
        .nonnegative("Total cannot be negative"),
    status: z.enum(["ACT", "INA"], {
        required_error: "Please select a status",
    }).default("ACT"),
})

export const defaultFormValues = {
    repairCode: "",
    customerId: undefined,
    vehicleId: undefined,
    jobId: undefined,
    mechanicId: undefined,
    currentMileage: undefined,
    total: undefined,
    status: "ACT" as "ACT" | "INA",
}

export const fetchRepairs = async (): Promise<Repair[]> => {
    const response = await apiService.get(
        API_URLS.getAllRepairs,
        {
            toast: {
                enabled: true,
                loading: {
                    message: 'Fetching Repairs...',
                },
                error: {
                    message: 'Failed to fetch Repairs',
                }
            }
        })
    return response;
};

export const fetchRepairsWithDetails = async (filters?: RepairSearchFilters): Promise<RepairWithDetails[]> => {

    // Construct URL parameters if filters are provided
    let queryParams = '';

    if (filters) {
        const params = new URLSearchParams();

        // Add customer IDs if present
        if (filters.customerIds && filters.customerIds.length > 0) {
            filters.customerIds.forEach(id => params.append('customerIds', id.toString()));
        }

        // Add vehicle license plate if present
        if (filters.vehicleLicensePlate) {
            params.append('vehicleLicensePlate', filters.vehicleLicensePlate);
        }

        queryParams = params.toString() ? `?${params.toString()}` : '';
    }

    const response = await apiService.get(
        `${API_URLS.getAllRepairsWithDetails}${queryParams}`,
        {
            toast: {
                enabled: true,
                loading: {
                    message: 'Fetching Repairs...',
                },
                error: {
                    message: 'Failed to fetch Repairs',
                }
            }
        })
    return response;
};

export const AddRepair = async (formData: FormData) => {
    const response = await apiService.post(
        API_URLS.addRepair,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            toast: {
                enabled: true,
                loading: { message: "Updating Repair..." },
                success: { message: "Repair updated successfully" },
            },
        })
    return response;
};

export const updateRepair = async (repairID: number, formData: FormData) => {
    const response = await apiService.put(
        API_URLS.updateRepair(repairID),
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            toast: {
                enabled: true,
                loading: { message: "Updating Repair..." },
                success: { message: "Repair updated successfully" },
            },
        })
    return response;
};

export const fetchRepairById = async (repairID: number): Promise<Repair> => {
    const response = await apiService.get(
        API_URLS.getRepairById(repairID),
        {
            headers: {
                'Content-Type': 'application/json',
            },
            toast: {
                enabled: true,
                loading: {
                    message: 'Fetching Repair...',
                },
                error: {
                    message: 'Failed to fetch Repair',
                }
            }
        })
    return response;
};

// export const getSpecificVehicleOfCustomer = async (customerId: number, vehicleId: number): Promise<Vehicle> => {
//     const response = await apiService.get(
//         API_URLS.getSpecificVehicleOfCustomer(customerId, vehicleId),
//         {
//             toast: {
//                 enabled: true,
//                 loading: {
//                     message: 'Fetching Vehicle...',
//                 },
//                 error: {
//                     message: 'Failed to fetch Vehicle',
//                 }
//             }
//         }
//     )
//     return response;
// }

// TODO: button success validation