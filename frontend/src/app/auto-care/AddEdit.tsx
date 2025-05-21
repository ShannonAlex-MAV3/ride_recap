import { AutoCare } from "@/@types";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { constants } from "../../constants";
import { getVehiclesByCustomerId, Vehicle } from "../customer/Util";
import { AddAutoCare, autoCareFormSchema, fetchAutoCareById, updateAutoCare } from "./util";
import { useMasterStore } from "@/hooks/use-master-store";

type FormValues = z.infer<typeof autoCareFormSchema>;

const AddEditAutoCare = () => {
  const { autoCareID } = useParams<{ autoCareID: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [autoCare, setAutoCare] = useState<AutoCare | null>(null);
  const { customers, jobs, fetchCustomers, fetchJobs } = useMasterStore();
  const [isLoading, setIsLoading] = useState(false);

  const availableMetricTypes = Object.values(constants.AUTOCARE_METRICS).map((metric) => metric);

  const autoCareForm = useForm<FormValues>({
    resolver: zodResolver(autoCareFormSchema),
    defaultValues: {
      autoCareCode: "",
      customerId: undefined,
      vehicleId: undefined,
      jobId: undefined,
      mechanicName: "",
      currentMileage: undefined,
      metrics: [{ type: constants.AUTOCARE_METRICS.TIME_PERIOD, value: undefined }],
    },
    mode: "onChange",
  });

  useEffect(() => {
    init();
  }, [customers.length, jobs.length, fetchCustomers, fetchJobs, autoCareID]);

  const watchedCustomerId = autoCareForm.watch("customerId");
  // Handle fetching vehicles when customer ID changes
  useEffect(() => {
    if (!watchedCustomerId) {
      setVehicles([]);
      return;
    }

    const fetchVehicles = async () => {
      const vehicleData = await getVehiclesByCustomerId(parseInt(watchedCustomerId, 10));
      if (vehicleData && vehicleData.length > 0) {
        setVehicles(vehicleData);
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [watchedCustomerId]);

  const init = async () => {
    setIsLoading(true);
    // Fetch customers and jobs if they're not already loaded
    if (customers.length === 0) {
      await fetchCustomers();
    }

    if (jobs.length === 0) {
      await fetchJobs();
    }

    if (!autoCareID) return;
    fetchAutoCareById(parseInt(autoCareID)).then((response) => {
      if (response) {
        console.log("Auto Care fetched successfully:", response);
        setAutoCare(response);

        // Reset form with string values consistently
        const customerId = String(response.customerID);

        // First set the customerId to trigger vehicle loading
        autoCareForm.setValue("customerId", customerId, {
          shouldValidate: true,
          shouldDirty: false,
        });

        // Then fetch vehicles for this customer
        getVehiclesByCustomerId(response.customerID).then((vehicleData) => {
          if (vehicleData && vehicleData.length > 0) {
            setVehicles(vehicleData);

            // Only after vehicles are loaded, set the vehicleId
            setTimeout(() => {
              autoCareForm.setValue("vehicleId", String(response.vehicleID), {
                shouldValidate: true,
                shouldDirty: false,
              });
            }, 100);
          }
        });

        // Set other form values
        autoCareForm.setValue("autoCareCode", response.autoCareCode, {
          shouldValidate: true,
          shouldDirty: false,
        });
        autoCareForm.setValue("jobId", String(response.jobID), {
          shouldValidate: true,
          shouldDirty: false,
        });
        autoCareForm.setValue("mechanicName", response.mechanic ?? "", {
          shouldValidate: true,
          shouldDirty: false,
        });
        autoCareForm.setValue("currentMileage", response.currentMileage, {
          shouldValidate: true,
          shouldDirty: false,
        });

        // Set metrics
        autoCareForm.setValue(
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
      }
    });
    setIsLoading(false);
  };

  const onSubmit = async (data: FormValues) => {
    const rq: AutoCare = {
      customerID: parseInt(data.customerId, 10),
      vehicleID: parseInt(data.vehicleId, 10),
      jobID: parseInt(data.jobId, 10),
      mechanic: data.mechanicName,
      currentMileage: data.currentMileage ?? 0,
      metricConfig: data.metrics.map((metric) => ({
        metric: metric.type,
        value: metric.value ?? 0,
      })),
      status: "ACT", // Assuming this is needed for the AutoCare type
    };

    // If we're editing an existing record
    if (!isNew && autoCare?.autoCareID) {
      rq.autoCareID = autoCare.autoCareID;
      rq.autoCareCode = autoCare.autoCareCode;

      const response = await updateAutoCare(rq);
      if (response) {
        console.log("Auto Care updated successfully:", response);
        setAutoCare(response);
      }
    } else {
      // Create new Auto Care
      const response = await AddAutoCare(rq);
      if (response) {
        console.log("Auto Care added successfully:", response);

        // Reset the form with the new autoCareCode
        autoCareForm.setValue("autoCareCode", response.autoCareCode, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
        setAutoCare(response);
      }
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: autoCareForm.control,
    name: "metrics",
  });

  const handleAddMetric = () => {
    if (availableMetricTypes.length > 0) {
      //@ts-expect-error error
      append({ type: availableMetricTypes[0], value: undefined });
    }
  };

  const { isSubmitting, isSubmitted: isSuccess } = autoCareForm.formState;
  const isNew = !autoCare;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Add Auto Care" : "Edit Auto care"}</h1>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        {!isLoading && <Form {...autoCareForm}>
          <form onSubmit={autoCareForm.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              {/* Auto Care Code */}
              <FormField
                control={autoCareForm.control}
                disabled={true}
                name="autoCareCode"
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
                control={autoCareForm.control}
                name="customerId"
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
                            autoCareForm.setValue("vehicleId", "");
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
                control={autoCareForm.control}
                disabled={!isNew}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Vehicle <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        disabled={!autoCareForm.watch("customerId") || isSubmitting || !isNew}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              autoCareForm.watch("customerId") ? "Select a vehicle" : "Select a customer first"
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
                control={autoCareForm.control}
                name="jobId"
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
                control={autoCareForm.control}
                name="mechanicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mechanic Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mechanic name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Current Mileage */}
              <FormField
                control={autoCareForm.control}
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
                    Autocare Metrics <span className="text-red-500">*</span>
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
                        control={autoCareForm.control}
                        name={`metrics.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Metric Type <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select disabled={isSubmitting} onValueChange={field.onChange} value={field.value}>
                                {" "}
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
                        control={autoCareForm.control}
                        name={`metrics.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {autoCareForm.watch(`metrics.${index}.type`) === constants.AUTOCARE_METRICS.TIME_PERIOD
                                ? "Time Period (months)"
                                : "Distance (km)"}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={
                                  autoCareForm.watch(`metrics.${index}.type`) === constants.AUTOCARE_METRICS.TIME_PERIOD
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

                {autoCareForm.formState.errors.metrics?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {autoCareForm.formState.errors.metrics.root.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-6">
              {" "}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isNew && autoCare) {
                    // In edit mode, preserve the ID and code
                    autoCareForm.reset({
                      autoCareCode: autoCare.autoCareCode,
                      customerId: autoCare.customerID.toString(),
                      vehicleId: autoCare.vehicleID.toString(),
                      jobId: autoCare.jobID.toString(),
                      mechanicName: autoCare.mechanic || "",
                      currentMileage: autoCare.currentMileage,
                      metrics: autoCare.metricConfig.map((metric) => ({
                        type: metric.metric,
                        value: metric.value,
                      })),
                    });
                  } else {
                    // In add mode, completely reset
                    autoCareForm.reset({
                      autoCareCode: "",
                      customerId: "",
                      vehicleId: "",
                      jobId: "",
                      mechanicName: "",
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
                disabled={isSubmitting || !autoCareForm.formState.isValid}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : null}
                {isSubmitting ? "Submitting..." : isSuccess ? "Success!" : isNew ? "Add Auto Care" : "Update Auto Care"}
              </Button>
            </CardFooter>
          </form>
        </Form>}
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

export default AddEditAutoCare;
