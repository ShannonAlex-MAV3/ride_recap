import { z } from "zod";
import { constants } from '../../constants';
import apiService from "@/services/api-service";
import { API_URLS } from "@/api";
import { AutoCare, AutoCareMetric } from "@/@types";

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


export const autoCareFormSchema = z.object({
  autoCareCode: z.string().nullable().optional(),
  customerId: z.string({
    required_error: "Please select a customer",
  }),
  vehicleId: z.string({
    required_error: "Please select a vehicle",
  }),
  jobId: z.string({
    required_error: "Please select a job",
  }),
  mechanicName: z
    .string({
      required_error: "Please enter mechanic name",
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

export const AddAutoCare = async (data: AutoCare) => {
  const response = await apiService.post(
    API_URLS.addAutoCare,
    data,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Adding Auto Care...',
        },
        success: {
          message: 'Auto Care added successfully',
        },
      }
    })
  return response;
};

export const updateAutoCare = async (data: AutoCare) => {
  const response = await apiService.put(
    API_URLS.updateAutoCare(data.autoCareID!),
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


export const fetchAutoCares = async (): Promise<AutoCare[]> => {
  const response = await apiService.get(
    API_URLS.getAllAutoCares,
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Fetching Auto Cares...',
        },
        error: {
          message: 'Failed to fetch Auto Cares',
        }
      }
    })
  return response;
};

export const fetchAutoCareById = async (autoCareID: number): Promise<AutoCare> => {
  const response = await apiService.get(
    API_URLS.getAutoCareById(autoCareID),
    {
      toast: {
        enabled: true,
        loading: {
          message: 'Fetching Auto Care...',
        },
        error: {
          message: 'Failed to fetch Auto Care',
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