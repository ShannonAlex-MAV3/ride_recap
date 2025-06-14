import { Repair, Vehicle } from "@/@types";
import { useMasterStore } from "@/hooks/use-master-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import {
  AddRepair,
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
import { CheckCircle2, Loader2 } from "lucide-react";
import { getVehiclesByCustomerId } from "../customer/Util";

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
  } = useMasterStore();

  const repairForm = useForm<FormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: {
      repairCode: "",
      customerId: undefined,
      vehicleId: undefined,
      jobId: undefined,
      mechanicId: undefined,
      currentMileage: undefined,
      status: `ACT`,
    },
    mode: "onChange",
  });

  console.log("repair id:", repairID)

  useEffect(() => {
    init();
  }, [
    customers.length,
    jobs.length,
    mechanics.length,
    fetchCustomers,
    fetchJobs,
    repairID,
    fetchMechanics,
  ]);

  const watchedCustomerId = repairForm.watch("customerId");
  // Handle fetching vehicles when customer ID changes
  useEffect(() => {
    if (!watchedCustomerId) {
      setVehicles([]);
      return;
    }
    console.log("vehicle")

    const fetchVehicles = async () => {
      const vehicleData = await getVehiclesByCustomerId(
        parseInt(watchedCustomerId, 10)
      );
      if (vehicleData && vehicleData.length > 0) {
        setVehicles(vehicleData);
      } else {
        setVehicles([]);
      }
    };

    fetchVehicles();
  }, [watchedCustomerId]);

  const init = async () => {
    console.log("init - started");
    setIsLoading(true);

    // Fetch customers and jobs if they're not already loaded
    if (customers.length === 0) {
      await fetchCustomers();
    }

    if (jobs.length === 0) {
      await fetchJobs();
    }

    if (mechanics.length === 0) {
      await fetchMechanics();
    }
    console.log("init - !repairID");

    if (!repairID) {
      setIsLoading(false);
      return;
    }

    console.log("init - fetchRepairById");

    fetchRepairById(parseInt(repairID)).then((response) => {
      if (response) {
        console.log("Repair fetched successfully:", response);
        setRepair(response);

        // Reset form with string values consistently
        const customerId = String(response.customerID);

        // First set the customerId to trigger vehicle loading
        repairForm.setValue("customerId", customerId, {
          shouldValidate: true,
          shouldDirty: false,
        });

        // Then fetch vehicles for this customer
        getVehiclesByCustomerId(response.customerID).then((vehicleData) => {
          if (vehicleData && vehicleData.length > 0) {
            setVehicles(vehicleData);

            // Only after vehicles are loaded, set the vehicleId
            setTimeout(() => {
              repairForm.setValue("vehicleId", String(response.vehicleID), {
                shouldValidate: true,
                shouldDirty: false,
              });
            }, 100);
          }
        });

        // Set other form values
        repairForm.setValue("repairCode", response.repairCode, {
          shouldValidate: true,
          shouldDirty: false,
        });
        repairForm.setValue("jobId", String(response.jobID), {
          shouldValidate: true,
          shouldDirty: false,
        });
        repairForm.setValue("mechanicId", String(response.jobID), {
          shouldValidate: true,
          shouldDirty: false,
        });
        repairForm.setValue("currentMileage", response.currentMileage, {
          shouldValidate: true,
          shouldDirty: false,
        });
        // repairForm.setValue("status", response.status, {
        //   shouldValidate: true,
        //   shouldDirty: false,
        // });
      }
    });
    console.log("init - end");

    setIsLoading(false);
  };

  const { isSubmitting, isSubmitted: isSuccess } = repairForm.formState;
  const isNew = !repair;

  const onSubmit = async (data: FormValues) => {
    const rq: Repair = {
      customerID: parseInt(data.customerId, 10),
      vehicleID: parseInt(data.vehicleId, 10),
      jobID: parseInt(data.jobId, 10),
      mechanicID: parseInt(data.mechanicId, 10),
      currentMileage: data.currentMileage ?? 0,
      status: data.status,
    };

    // If we're editing an existing record
    if (!isNew && repair?.repairID) {
      rq.repairID = repair.repairID;
      rq.repairCode = repair.repairCode;

      const response = await updateRepair(rq);
      if (response) {
        console.log("Repair updated successfully:", response);
        setRepair(response);
      }
    } else {
      // Create new Repair
      const response = await AddRepair(rq);
      if (response) {
        console.log("Repair added successfully:", response);

        // Reset the form with the new repairCode
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
                          status: repair.status ?? `ACT`,
                        }); 
                      } else {
                        // In add mode, completely reset
                        repairForm.reset({
                          repairCode: "",
                          customerId: "",
                          vehicleId: "",
                          jobId: "",
                          mechanicId: "",
                          currentMileage: undefined,
                          status: `ACT`,
                        });
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
                    ) : isSuccess ? (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    ) : null}
                    {isSubmitting
                      ? "Submitting..."
                      : isSuccess
                      ? "Success!"
                      : isNew
                      ? "Add Repair"
                      : "Update Repair"}
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
    </>
  );
};
export default AddEditRepair;
