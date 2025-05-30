import { AutoCareMetric, Service } from "@/@types";
import { API_URLS } from "@/api";
import apiService from "@/services/api-service";
import { z } from "zod";
import { constants } from '../../constants';

const metricSchema = z.object({
  type: z.enum([constants.AUTOCARE_METRICS.TIME_PERIOD, constants.AUTOCARE_METRICS.DISTANCE_TRAVELLED], {
    required_error: "Please select a metric type",
  }),
  value: z.coerce
    .number({
      required_error: "Please enter a value",
      invalid_type_error: "Please enter a valid number",
    })
    .positive("Value must be greater than 0"),
})


export const serviceFormSchema = z.object({
  serviceCode: z.string().nullable().optional(),
  customerID: z.string({
    required_error: "Please select a customer",
  }),
  vehicleID: z.string({
    required_error: "Please select a vehicle",
  }),
  jobID: z.string({
    required_error: "Please select a job",
  }),
  mechanicID: z
    .string({
      required_error: "Please select a mechanic",
    })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  currentMileage: z.coerce
    .number({
      required_error: "Please enter current mileage",
      invalid_type_error: "Please enter a valid number",
    })
    .nonnegative("Mileage cannot be negative"),
  metrics: z
    .array(metricSchema)
    .min(1, "At least one metric is required")
    .refine((metrics) => {
      const types = metrics.map((m) => m.type)
      return new Set(types).size === types.length
    }, "Duplicate metric types are not allowed"),
})

export const AddService = async (data: Service) => {
  const response = await apiService.post(
    API_URLS.SERVICE.addService,
    data,
    {
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

export const updateService = async (data: Service) => {
  const response = await apiService.put(
    API_URLS.SERVICE.updateService(data.serviceID!),
    data,
    {
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


export const fetchServices = async (): Promise<Service[]> => {
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