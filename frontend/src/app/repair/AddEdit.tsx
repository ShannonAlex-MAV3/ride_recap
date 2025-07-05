import { Repair, Vehicle } from "@/@types";
import { useMasterStore } from "@/hooks/use-master-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import {
  AddRepair,
  defaultFormValues,
  fetchRepairById,
  repairFormSchema,
  updateRepair,
} from "./Util";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getVehiclesByCustomerId } from "../customer/Util";
import FileUpload from "@/components/file-upload/FileUpload";

type FormValues = z.infer<typeof repairFormSchema>;

// TODO: Add Total & file upload

const AddEditRepair = () => {
  const { repairID } = useParams<{ repairID: string }>();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const {
    customers,
    jobs,
    fetchCustomers,
    fetchJobs,
    mechanics,
    fetchMechanics,
    isLoadingCustomers,
    isLoadingJobs,
    isLoadingMechanics,
  } = useMasterStore();
  const [files, setFiles] = useState<File[]>([]);

  const repairForm = useForm<FormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: defaultFormValues,
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
  }, []);

  // Separate effect to handle repair loading when ID changes
  useEffect(() => {
    /* if(customers.length == 0 || jobs.length == 0 || mechanics.length == 0) return;*/

    if (!repairID) return;

    const loadRepair = async () => {
      setIsLoading(true);

      try {
        const response = await fetchRepairById(parseInt(repairID));
        setRepair(response);

        if (response) {
          repairForm.reset({
            repairCode: response.repairCode,
            customerId: String(response.customerID),
            vehicleId: String(response.vehicleID),
            jobId: String(response.jobID),
            mechanicId: String(response.mechanicID),
            currentMileage: response.currentMileage,
            total: response.total,
            status: (response.status as "ACT" | "INA") || "ACT",
          });
        }
      } catch (error) {
        console.error("Error loading repair:", error);
      } finally {
        setFiles([]);
        setIsLoading(false);
      }
    };

    loadRepair();
  }, [repairID, repairForm]);

  // Fetch vehicles when customer changes
  useEffect(() => {
    const fetchVehicles = async () => {
      const customerID = repairForm.getValues("customerId");
      if (customerID) {
        const vehicleData = await getVehiclesByCustomerId(parseInt(customerID));
        setVehicles(vehicleData);
      } else {
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, [repairForm.getValues("customerId")]);

  const { isSubmitting } = repairForm.formState;
  const isNew = !repair;

  const onSubmit = async (_d: FormValues) => {
    const values = repairForm.getValues();

    const formData = new FormData();

    // Basic fields
    formData.append("customerID", values.customerId);
    formData.append("vehicleID", values.vehicleId);
    formData.append("jobID", values.jobId);
    formData.append("mechanicID", values.mechanicId);
    formData.append("currentMileage", values.currentMileage?.toString() ?? "0");
    formData.append("total", values.total?.toString() ?? "0");
    formData.append("status", values.status || "ACT");

    // Attachments (files uploaded)
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    // Reference strings (existing attachments you're keeping)
    formData.append(
      "attachmentsRefs",
      JSON.stringify(repair?.attachmentRefs || [])
    );

    if (!isNew && repair?.repairID) {
      // Add repairID and repairCode when editing
      formData.append("repairID", repair.repairID.toString());
      formData.append("repairCode", repair.repairCode ?? "");

      const response = await updateRepair(repair.repairID, formData);

      if (response) {
        setRepair(response);
      }
    } else {
      // Creating new repair
      const response = await AddRepair(formData);
      if (response) {

        repairForm.setValue("repairCode", response.repairCode, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
        setRepair(response);
      }
    }
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">
          {isNew ? "Add Repair" : "Edit Repair"}
        </h1>
        <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
          {!isLoading && (
            <Form {...repairForm}>
              <form onSubmit={repairForm.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 pt-6">
                  {/* Auto Care Code */}
                  <FormField
                    control={repairForm.control}
                    disabled={true}
                    name="repairCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Repair Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-4/5"
                            placeholder="This is generated automatically"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />{" "}
                  {/* Customer Selection */}
                  <FormField
                    control={repairForm.control}
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
                                repairForm.setValue("vehicleId", "");
                              }
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="w-4/5">
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers?.map((customer) => (
                                <SelectItem
                                  key={customer.customerID}
                                  value={customer.customerID.toString()}
                                >
                                  {customer.firstName} {customer.lastName} (
                                  {customer.customerCode})
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
                    control={repairForm.control}
                    disabled={!isNew}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Vehicle <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            disabled={
                              !repairForm.watch("customerId") ||
                              isSubmitting ||
                              !isNew
                            }
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-4/5">
                              <SelectValue
                                placeholder={
                                  repairForm.watch("customerId")
                                    ? "Select a vehicle"
                                    : "Select a customer first"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles.length > 0 ? (
                                vehicles.map((vehicle) => (
                                  <SelectItem
                                    key={vehicle.vehicleID}
                                    value={vehicle.vehicleID.toString()}
                                  >
                                    {vehicle.licensePlate} - {vehicle.make}{" "}
                                    {vehicle.model} ({vehicle.color})
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
                    control={repairForm.control}
                    name="jobId"
                    disabled={!isNew}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Job <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            disabled={isSubmitting || !isNew}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-4/5">
                              <SelectValue placeholder="Select a job" />
                            </SelectTrigger>
                            <SelectContent>
                              {jobs?.map((job) => (
                                <SelectItem
                                  key={job.jobID}
                                  value={job.jobID.toString()}
                                >
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
                    control={repairForm.control}
                    name="mechanicId"
                    disabled={!isNew}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mechanic <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            disabled={isSubmitting || !isNew}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-4/5">
                              <SelectValue placeholder="Select a mechanic" />
                            </SelectTrigger>
                            <SelectContent>
                              {mechanics?.map((mechanic) => (
                                <SelectItem
                                  key={mechanic.mechanicID}
                                  value={mechanic.mechanicID.toString()}
                                >
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
                    control={repairForm.control}
                    name="currentMileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Current Mileage (km){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-4/5"
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
                  {/* Total */}
                  <FormField
                    control={repairForm.control}
                    name="total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Total <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-4/5"
                            type="number"
                            placeholder="Enter total"
                            {...field}
                            disabled={isSubmitting}
                            min="0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* File Upload */}
                  <FileUpload
                    label="Upload Receipts & Attachments"
                    files={files}
                    onUploadFile={(files: File[]) =>
                      setFiles((prev) => [...prev, ...files])
                    }
                    fileRefs={repair?.attachmentRefs || []}
                    disabled={repairForm.formState.disabled || isSubmitting}
                  />
                  <FormField
                    control={repairForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium">
                          Status <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="w-4/5">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACT">Active</SelectItem>
                              <SelectItem value="INA">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!isNew && repair) {
                        // In edit mode, preserve the ID and code
                        //@ts-expect-error error
                        repairForm.reset({
                          repairCode: repair.repairCode,
                          customerId: repair.customerID.toString(),
                          vehicleId: repair.vehicleID.toString(),
                          jobId: repair.jobID.toString(),
                          mechanicId: repair.mechanicID.toString(),
                          currentMileage: repair.currentMileage,
                          total: repair.total,
                          status: repair.status ?? `ACT`,
                        });
                      } else {
                        // In add mode, completely reset
                        repairForm.reset(defaultFormValues);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !repairForm.formState.isValid}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isSubmitting
                      ? "Submitting..."
                      : isNew
                      ? "Add Repair"
                      : "Update Repair"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
          {isLoading ||
            isLoadingCustomers ||
            isLoadingJobs ||
            (isLoadingMechanics && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Loading...
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
export default AddEditRepair;
