import { AutoCareMetric, Service, ServiceWithDetails } from "@/@types";
import { API_URLS } from "@/api";
import apiService from "@/services/api-service";
import { z } from "zod";
import { constants } from '../../constants';

// Create the form schema
const maintenanceValueSchema = z.array(z.enum(["R", "T", "C", "N", "Y"])).optional()

const lubricantsSchema = z.object({
  engineOil: z.object({
    values: maintenanceValueSchema,
    oil: z.string().optional(),
  }),
  transmissionOilAutoMan: z.object({
    values: maintenanceValueSchema,
    autoMan: z.enum(["AUTO", "MANUAL"]).optional(),
    make: z.string().optional(),
    type: z.string().optional(),
  }),
  differentialOilFrontRear: z.object({
    values: maintenanceValueSchema,
    make: z.string().optional(),
    type: z.string().optional(),
  }),
  powerSteeringOil: z.object({
    values: maintenanceValueSchema,
    make: z.string().optional(),
    type: z.string().optional(),
  }),
  brakeFluid: z.object({
    values: maintenanceValueSchema,
    make: z.string().optional(),
    type: z.string().optional(),
  }),
})

const fluidsSchema = z.object({
  clutchFluid: maintenanceValueSchema,
  radiatorCoolant: maintenanceValueSchema,
  inverterCoolant: maintenanceValueSchema,
  batteryWater: maintenanceValueSchema,
  windscreenCleaner: maintenanceValueSchema,
})

const filtersSchema = z.object({
  oilFilter: maintenanceValueSchema,
  fuelFilter: maintenanceValueSchema,
  airFilter: maintenanceValueSchema,
  lineFilter: maintenanceValueSchema,
  cabinFilter: maintenanceValueSchema,
})
export const serviceFormSchema = z.object({
  serviceCode: z.string().nullable().optional(),
  customerID: z.string({
    required_error: "Please select a customer",
  }),
  vehicleID: z.string({
    required_error: "Please select a vehicle",
  }),
  mechanicID: z
    .string({
      required_error: "Please select a mechanic",
    }),
  currentMileage: z.coerce
    .number({
      required_error: "Please enter current mileage",
      invalid_type_error: "Please enter a valid number",
    })
    .nonnegative("Mileage cannot be negative"),
  serviceDate: z.coerce
    .date({
      required_error: "Please select a service date",
      invalid_type_error: "Please select a valid date",
    }),
  maintenance: z.object({
    lubricants: lubricantsSchema,
    fluids: fluidsSchema,
    filters: filtersSchema,
  }),
  status: z.enum(["ACT", "INA"]).optional(),
})

export const defaultFormValues = {
      serviceCode: "",
      customerID: undefined,
      vehicleID: undefined,
      mechanicID: "",
      currentMileage: undefined,
      serviceDate: new Date(),
      maintenance: {
        lubricants: {
          engineOil: {
            values: [],
            oil: "",
          },
          transmissionOilAutoMan: {
            values: [],
            autoMan: undefined,
            make: "",
            type: "",
          },
          differentialOilFrontRear: {
            values: [],
            make: "",
            type: "",
          },
          powerSteeringOil: {
            values: [],
            make: "",
            type: "",
          },
          brakeFluid: {
            values: [],
            make: "",
            type: "",
          },
        },
        fluids: {
          clutchFluid: [],
          radiatorCoolant: [],
          inverterCoolant: [],
          batteryWater: [],
          windscreenCleaner: [],
        },
        filters: {
          oilFilter: [],
          fuelFilter: [],
          airFilter: [],
          lineFilter: [],
          cabinFilter: [],
        },
      },
      status: "ACT" as "ACT" | "INA",
    };

export const saveService = async (data: FormData) => {
  const response = await apiService.post(
    API_URLS.SERVICE.addService,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      toast: {
        enabled: true,
        loading: {
          message: 'Adding Service...',
        },
        success: {
          message: 'Service added successfully',
        },
      }
    })
  return response;
};

export const updateService = async (id: number, data: FormData) => {
  const response = await apiService.put(
    API_URLS.SERVICE.updateService(id),
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      toast: {
        enabled: true,
        loading: {
          message: 'Updating Auto Care...',
        },
        success: {
          message: 'Auto Care updated successfully',
        },
      }
    })
  return response;
};


export const fetchServices = async (): Promise<ServiceWithDetails[]> => {
  const response = await apiService.get(
    API_URLS.SERVICE.getAllServices,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Fetching Services...',
        },
        error: {
          message: 'Failed to fetch Services',
        }
      }
    })
  return response;
};

export const fetchServiceById = async (serviceID: number): Promise<Service> => {
  const response = await apiService.get(
    API_URLS.SERVICE.getServiceById(serviceID),
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Fetching Service...',
        },
        error: {
          message: 'Failed to fetch Service',
        }
      }
    })
  return response;
};


export const calculateNextServiceDate = (config: AutoCareMetric, createdData: string): string => {
  const createdDate = new Date(createdData);
  const nextServiceDate = new Date(createdDate);

  if (config.metric === constants.AUTOCARE_METRICS.TIME_PERIOD) {
    nextServiceDate.setMonth(nextServiceDate.getMonth() + config.value);
  }

  return nextServiceDate.toLocaleDateString();
}

export const calculateNextServiceMileage = (config: AutoCareMetric, currentMileage: number): number => {
  let nextServiceMileage = currentMileage;

  if (config.metric === constants.AUTOCARE_METRICS.DISTANCE_TRAVELLED) {
    nextServiceMileage += config.value;
  }

  return nextServiceMileage;
}

export const calNextValue = (config: AutoCareMetric, currentMileage: number, createdData: string) => {
  switch (config.metric) {
    case constants.AUTOCARE_METRICS.TIME_PERIOD:
      return calculateNextServiceDate(config, createdData as string);
    case constants.AUTOCARE_METRICS.DISTANCE_TRAVELLED:
      return calculateNextServiceMileage(config, currentMileage as number);
  }
}