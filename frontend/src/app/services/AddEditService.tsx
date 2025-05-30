import { Service, Vehicle } from "@/@types";
import FileUpload from "@/components/file-upload/FileUpload";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMasterStore } from "@/hooks/use-master-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { constants } from "../../constants";
import { getVehiclesByCustomerId } from "../customer/Util";
import { AddService, fetchServiceById, serviceFormSchema, updateService } from "./util";

type FormValues = z.infer<typeof serviceFormSchema>;

const AddEditService = () => {
  const { serviceID } = useParams<{ serviceID: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const { customers, jobs, fetchCustomers, fetchJobs } = useMasterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const availableMetricTypes = Object.values(constants.AUTOCARE_METRICS).map((metric) => metric);

  const serviceForm = useForm<FormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceCode: "",
      customerID: undefined,
      vehicleID: undefined,
      jobID: undefined,
      mechanicID: "",
      currentMileage: undefined,
      metrics: [{ type: undefined, value: undefined }],
    },
    mode: "onChange",
  });

  // Effect to fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (customers.length === 0) {
        await fetchCustomers();
      }
      if (jobs.length === 0) {
        await fetchJobs();
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Separate effect to handle auto care loading when ID changes
  useEffect(() => {
    if (!serviceID) return;

    const loadService = async () => {
      setIsLoading(true);
      try {
        const response = await fetchServiceById(parseInt(serviceID));
        if (response) {
          setService(response);

          // Set form values from response
          serviceForm.setValue("customerID", String(response.customerID), {
            shouldValidate: true,
            shouldDirty: false,
          });

          serviceForm.setValue("serviceCode", response.serviceCode, {
            shouldValidate: true,
            shouldDirty: false,
            shouldTouch: false,
          });
          serviceForm.setValue("vehicleID", String(response.vehicleID), {
            shouldValidate: true,
            shouldDirty: false,
          });
          serviceForm.setValue("jobID", String(response.jobID), {
            shouldValidate: true,
            shouldDirty: false,
          });
          serviceForm.setValue("mechanicID", String(response.mechanicID), {
            shouldValidate: true,
            shouldDirty: false,
          });
          serviceForm.setValue("currentMileage", response.currentMileage, {
            shouldValidate: true,
            shouldDirty: false,
          });

          serviceForm.setValue(
            "metrics",
            response.metricConfig.map((metric) => ({
              type: metric.metric,
              value: metric.value,
            })),
            {
              shouldValidate: true,
              shouldDirty: false,
            }
          );

          // Fetch vehicles in the same effect
          const vehicleData = await getVehiclesByCustomerId(response.customerID);
          if (vehicleData && vehicleData.length > 0) {
            setVehicles(vehicleData);
            serviceForm.setValue("vehicleID", String(response.vehicleID), {
              shouldValidate: true,
              shouldDirty: false,
            });
          }
        }
      } catch (error) {
        console.error("Error loading auto care:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadService();
  }, [serviceID]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted with data:", data);
    const rq: Service = {
      customerID: !isNew ? service?.customerID : parseInt(data.customerID),
      vehicleID: !isNew ? service?.vehicleID : parseInt(data.vehicleID),
      jobID: !isNew ? service?.jobID : parseInt(data.jobID),
      mechanicID: !isNew ? service?.mechanicID : parseInt(data.mechanicID),
      currentMileage: data.currentMileage ?? 0,
      metricConfig: data.metrics.map((metric) => ({
        metric: metric.type,
        value: metric.value ?? 0,
      })),
      status: "ACT",
    };

    // If we're editing an existing record
    if (!isNew && service?.serviceID) {
      rq.serviceID = service.serviceID;
      rq.serviceCode = service.serviceCode;

      const response = await updateService(rq);
      if (response) {
        console.log("Auto Care updated successfully:", response);
        setService(response);
      }
    } else {
      // Create new Auto Care
      const response = await AddService(rq);
      if (response) {
        console.log("Service added successfully:", response);

        // Reset the form with the new serviceCode
        serviceForm.setValue("serviceCode", response.serviceCode, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
        setService(response);
      }
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: serviceForm.control,
    name: "metrics",
  });

  const handleAddMetric = () => {
    if (availableMetricTypes.length > 0) {
      //@ts-expect-error error
      append({ type: undefined, value: undefined });
    }
  };

  const { isSubmitting } = serviceForm.formState;
  const isNew = !service;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Add Auto Care" : "Edit Auto care"}</h1>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        {!isLoading && (
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6 pt-6">
                {/* Auto Care Code */}
                <FormField
                  control={serviceForm.control}
                  disabled={true}
                  name="serviceCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Auto Care Code <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="This is generated automatically" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />{" "}
                {/* Customer Selection */}
                <FormField
                  control={serviceForm.control}
                  name="customerID"
                  disabled={!isNew}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Customer <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={isSubmitting || !isNew}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset vehicle when customer changes
                            if (isNew) {
                              serviceForm.setValue("vehicleID", "");
                            }
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers?.map((customer) => (
                              <SelectItem key={customer.customerID} value={customer.customerID.toString()}>
                                {customer.firstName} {customer.lastName} ({customer.customerCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Vehicle Selection */}{" "}
                <FormField
                  control={serviceForm.control}
                  disabled={!isNew}
                  name="vehicleID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Vehicle <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={!serviceForm.watch("customerID") || isSubmitting || !isNew}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                serviceForm.watch("customerID") ? "Select a vehicle" : "Select a customer first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.length > 0 ? (
                              vehicles.map((vehicle) => (
                                <SelectItem key={vehicle.vehicleID} value={vehicle.vehicleID.toString()}>
                                  {vehicle.licensePlate} - {vehicle.make} {vehicle.model} ({vehicle.color})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-vehicles" disabled>
                                No vehicles available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Job Selection */}{" "}
                <FormField
                  control={serviceForm.control}
                  name="jobID"
                  disabled={!isNew}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Job <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select disabled={isSubmitting || !isNew} onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a job" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobs?.map((job) => (
                              <SelectItem key={job.jobID} value={job.jobID.toString()}>
                                {job.jobName} ({job.jobCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Mechanic Name */}
                <FormField
                  control={serviceForm.control}
                  name="mechanicID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mechanic <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Select Mechanic" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Current Mileage */}
                <FormField
                  control={serviceForm.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Current Mileage (km) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter current mileage"
                          {...field}
                          disabled={isSubmitting}
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Multiple Metrics */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Service Metrics <span className="text-red-500">*</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMetric}
                      disabled={isSubmitting || availableMetricTypes.length === 0}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Metric
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start p-4 border rounded-md bg-slate-50">
                      <div className="flex-1 space-y-4">
                        {/* Metric Type */}
                        <FormField
                          control={serviceForm.control}
                          name={`metrics.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Metric Type <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Select disabled={isSubmitting} onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select metric type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={constants.AUTOCARE_METRICS.TIME_PERIOD}>
                                      {constants.AUTOCARE_METRICS_DISPLAY.TIME_PERIOD}
                                    </SelectItem>
                                    <SelectItem value={constants.AUTOCARE_METRICS.DISTANCE_TRAVELLED}>
                                      {constants.AUTOCARE_METRICS_DISPLAY.DISTANCE_TRAVELLED}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Metric Value */}
                        <FormField
                          control={serviceForm.control}
                          name={`metrics.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {serviceForm.watch(`metrics.${index}.type`) === constants.AUTOCARE_METRICS.TIME_PERIOD
                                  ? "Time Period (months)"
                                  : "Distance (km)"}{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={
                                    serviceForm.watch(`metrics.${index}.type`) ===
                                    constants.AUTOCARE_METRICS.TIME_PERIOD
                                      ? "Enter months"
                                      : "Enter kilometers"
                                  }
                                  {...field}
                                  disabled={isSubmitting}
                                  min="0"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Remove button */}
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={isSubmitting}
                          className="mt-8"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove metric</span>
                        </Button>
                      )}
                    </div>
                  ))}

                  {serviceForm.formState.errors.metrics?.root && (
                    <p className="text-sm font-medium text-destructive">
                      {serviceForm.formState.errors.metrics.root.message}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <FileUpload
                  label="Upload Receipts"
                  files={files}
                  onUploadFile={(files: File[]) => setFiles((prev) => [...prev, ...files])}
                />

              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                {" "}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!isNew && service) {
                      // In edit mode, preserve the ID and code
                      serviceForm.reset({
                        serviceCode: service.serviceCode,
                        customerID: service.customerID.toString(),
                        vehicleID: service.vehicleID.toString(),
                        jobID: service.jobID.toString(),
                        mechanicID: service.mechanicID?.toString(),
                        currentMileage: service.currentMileage,
                        metrics: service.metricConfig.map((metric) => ({
                          type: metric.metric,
                          value: metric.value,
                        })),
                      });
                    } else {
                      // In add mode, completely reset
                      serviceForm.reset({
                        serviceCode: "",
                        customerID: "",
                        vehicleID: "",
                        jobID: "",
                        mechanicID: "",
                        currentMileage: undefined,
                        metrics: [{ type: constants.AUTOCARE_METRICS.TIME_PERIOD, value: undefined }],
                      });
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !serviceForm.formState.isValid}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Submitting..." : isNew ? "Add Auto Care" : "Update Auto Care"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEditService;
