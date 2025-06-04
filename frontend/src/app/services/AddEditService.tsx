import { Service, Vehicle } from "@/@types";
import FileUpload from "@/components/file-upload/FileUpload";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMasterStore } from "@/hooks/use-master-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { constants } from "../../constants";
import { getVehiclesByCustomerId } from "../customer/Util";
import { fetchServiceById, saveService, serviceFormSchema, updateService } from "./util";

type FormValues = z.infer<typeof serviceFormSchema>;

const AddEditService = () => {
  const { serviceID } = useParams<{ serviceID: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const { customers, jobs, fetchCustomers, fetchJobs, mechanics, fetchMechanics } = useMasterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const serviceForm = useForm<FormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      serviceCode: "",
      customerID: undefined,
      vehicleID: undefined,
      jobID: undefined,
      mechanicID: "",
      currentMileage: undefined,
      maintenance: {
        LUBRICANTS: {
          ENGINE_OIL: [],
          TRANSMISSION_OIL_AUTO_MA: [],
          DIFFERENTIAL_OIL_FRONT_REAR: [],
          POWER_STEERING_OIL: [],
          BRAKE_FLUID: [],
        },
        FLUIDS: {
          CLUTCH_FLUID: [],
          RADIATOR_COOLANT: [],
          INVERTER_COOLANT: [],
          BATTERY_WATER: [],
          WINDSCREEN_CLEANER: [],
        },
        FILTERS: {
          OIL_FILTER: [],
          FUEL_FILTER: [],
          AIR_FILTER: [],
          LINE_FILTER: [],
          CABIN_FILTER: [],
        },
      },
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

      if (mechanics.length === 0) {
        await fetchMechanics();
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, [customers.length, jobs.length, fetchCustomers, fetchJobs]);

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

          serviceForm.setValue("maintenance", response.maintenance, {
            shouldValidate: true,
            shouldDirty: false,
          });

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
        setFiles([])
        setIsLoading(false);
      }
    };

    loadService();
  }, [serviceID, serviceForm]);

  useEffect(() => {
    const fetchVehicles = async () => {
      const customerID = serviceForm.getValues("customerID");
      if (customerID) {
        const vehicleData = await getVehiclesByCustomerId(parseInt(customerID));
        setVehicles(vehicleData);
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [serviceForm.getValues("customerID")]);

  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted with data:", data);
    const formData = new FormData();
    formData.append("customerID", (isNew ? data.customerID : service.customerID.toString()) || "");
    formData.append("vehicleID", (isNew ? data.vehicleID : service.vehicleID.toString()) || "");
    formData.append("jobID", (isNew ? data.jobID : service.jobID.toString()) || "");
    formData.append("mechanicID", (isNew ? data.mechanicID : service.mechanicID?.toString()) || "");
    formData.append("currentMileage", data.currentMileage?.toString() ?? "0");
    formData.append("status", "ACT");

    formData.append(
      "maintenance",
      JSON.stringify({
        LUBRICANTS: data.maintenance.LUBRICANTS,
        FLUIDS: data.maintenance.FLUIDS,
        FILTERS: data.maintenance.FILTERS,
      })
    );

    // Append each file individually with the same field name
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    formData.append("attachmentsRefs", JSON.stringify(service?.attachmentRefs || []));

    if (isNew) addService(formData);
    else updateServiceData(formData);
  };

  const addService = async (formData: FormData) => {
    const response = await saveService(formData);
    if (!response) return;
    serviceForm.setValue("serviceCode", response.serviceCode, {
      shouldValidate: true,
      shouldDirty: false,
      shouldTouch: false,
    });
    setService(response);
  };

  const updateServiceData = async (formData: FormData) => {
    if (!service?.serviceID) return;
    formData.append("serviceID", service.serviceID.toString());
    const response = await updateService(service.serviceID, formData);
    if (!response) return;
    setService(response);
  };

  const handleClearSection = (sectionKey: keyof FormValues["maintenance"]) => {
    const emptySection =
      sectionKey === "LUBRICANTS"
        ? {
            ENGINE_OIL: [],
            TRANSMISSION_OIL_AUTO_MA: [],
            DIFFERENTIAL_OIL_FRONT_REAR: [],
            POWER_STEERING_OIL: [],
            BRAKE_FLUID: [],
          }
        : sectionKey === "FLUIDS"
        ? {
            CLUTCH_FLUID: [],
            RADIATOR_COOLANT: [],
            INVERTER_COOLANT: [],
            BATTERY_WATER: [],
            WINDSCREEN_CLEANER: [],
          }
        : {
            OIL_FILTER: [],
            FUEL_FILTER: [],
            AIR_FILTER: [],
            LINE_FILTER: [],
            CABIN_FILTER: [],
          };

    serviceForm.setValue(`maintenance.${sectionKey}`, emptySection, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCheckboxChange = (
    sectionKey: keyof FormValues["maintenance"],
    subSectionKey: string,
    value: string,
    checked: boolean
  ) => {
    const currentMaintenance = serviceForm.getValues("maintenance");
    const currentSection = currentMaintenance[sectionKey] as Record<string, string[]>;
    const currentValues = currentSection[subSectionKey] || [];

    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serviceForm.setValue(`maintenance.${sectionKey}.${subSectionKey}` as any, newValues, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const isCheckboxChecked = (
    sectionKey: keyof FormValues["maintenance"],
    subSectionKey: string,
    value: string
  ): boolean => {
    const currentMaintenance = serviceForm.getValues("maintenance");
    if (!currentMaintenance || !currentMaintenance[sectionKey]) return false;

    const currentSection = currentMaintenance[sectionKey] as Record<string, string[]>;
    const currentValues = currentSection[subSectionKey] || [];

    return currentValues.includes(value);
  };

  const maintenceTypes = Object.entries(constants.SERVICE_MAINTENANCE_TYPES);
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
                />
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
                {/* Vehicle Selection */}
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
                {/* Job Selection */}
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
                {/* Mechanic Selection */}{" "}
                <FormField
                  control={serviceForm.control}
                  name="mechanicID"
                  disabled={!isNew}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mechanic <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select disabled={isSubmitting || !isNew} onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-4/5">
                            <SelectValue placeholder="Select a mechanic" />
                          </SelectTrigger>
                          <SelectContent>
                            {mechanics?.map((mechanic) => (
                              <SelectItem key={mechanic.mechanicID} value={mechanic.mechanicID.toString()}>
                                {mechanic.firstName} ({mechanic.nic})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                {/* Maintenance Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Service Maintenance <span className="text-red-500">*</span>
                    </div>
                  </div>

                  {maintenceTypes.map(([sectionKey, section]) => (
                    <div key={sectionKey} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">{section.label}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearSection(sectionKey as keyof FormValues["maintenance"])}
                        >
                          Clear Section
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {section.subSections.map((subSection) => (
                          <div key={subSection.value} className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground block">
                              {subSection.label}
                            </Label>
                            <div className="space-y-2">
                              {Object.entries(constants.SERVICE_MAINTENANCE_VALUES).map(([key, value]) => (
                                <div key={key} className="flex flex-row items-center space-x-2 space-y-0">
                                  <Checkbox
                                    checked={isCheckboxChecked(
                                      sectionKey as keyof FormValues["maintenance"],
                                      subSection.value,
                                      key
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleCheckboxChange(
                                        sectionKey as keyof FormValues["maintenance"],
                                        subSection.value,
                                        key,
                                        !!checked
                                      )
                                    }
                                  />
                                  <Label className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{value}</span>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {sectionKey !== "FILTERS" && <Separator />}
                    </div>
                  ))}
                </div>
                {/* File Upload */}
                <FileUpload
                  label="Upload Receipts & Attachments"
                  files={files}
                  onUploadFile={(files: File[]) => setFiles((prev) => [...prev, ...files])}
                  fileRefs={service?.attachmentRefs || []}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-6">
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
                        maintenance: {
                          LUBRICANTS: {
                            ENGINE_OIL: [],
                            TRANSMISSION_OIL_AUTO_MA: [],
                            DIFFERENTIAL_OIL_FRONT_REAR: [],
                            POWER_STEERING_OIL: [],
                            BRAKE_FLUID: [],
                          },
                          FLUIDS: {
                            CLUTCH_FLUID: [],
                            RADIATOR_COOLANT: [],
                            INVERTER_COOLANT: [],
                            BATTERY_WATER: [],
                            WINDSCREEN_CLEANER: [],
                          },
                          FILTERS: {
                            OIL_FILTER: [],
                            FUEL_FILTER: [],
                            AIR_FILTER: [],
                            LINE_FILTER: [],
                            CABIN_FILTER: [],
                          },
                        },
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
                        maintenance: {
                          LUBRICANTS: {
                            ENGINE_OIL: [],
                            TRANSMISSION_OIL_AUTO_MA: [],
                            DIFFERENTIAL_OIL_FRONT_REAR: [],
                            POWER_STEERING_OIL: [],
                            BRAKE_FLUID: [],
                          },
                          FLUIDS: {
                            CLUTCH_FLUID: [],
                            RADIATOR_COOLANT: [],
                            INVERTER_COOLANT: [],
                            BATTERY_WATER: [],
                            WINDSCREEN_CLEANER: [],
                          },
                          FILTERS: {
                            OIL_FILTER: [],
                            FUEL_FILTER: [],
                            AIR_FILTER: [],
                            LINE_FILTER: [],
                            CABIN_FILTER: [],
                          },
                        },
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
