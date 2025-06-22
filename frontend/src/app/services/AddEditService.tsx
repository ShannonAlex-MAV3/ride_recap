import { Service, Vehicle } from "@/@types";
import FileUpload from "@/components/file-upload/FileUpload";
import FormCheckbox from "@/components/form-components/FormCheckbox";
import FormInput from "@/components/form-components/FormInput";
import FormRadio from "@/components/form-components/FormRadio";
import FormSelect from "@/components/form-components/FormSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useMasterStore } from "@/hooks/use-master-store";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Path, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { constants, formFieldConstants } from "../../constants";
import { getVehiclesByCustomerId } from "../customer/Util";
import { defaultFormValues, fetchServiceById, saveService, serviceFormSchema, updateService } from "./util";

type FormValues = z.infer<typeof serviceFormSchema>;

const AddEditService = () => {
  const { serviceID } = useParams<{ serviceID: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const { customers, fetchCustomers, mechanics, fetchMechanics, isLoadingCustomers, isLoadingMechanics } =
    useMasterStore();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const serviceForm = useForm<FormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
    disabled: serviceID ? true : false,
  });

  // Effect to fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (customers.length === 0) {
        await fetchCustomers();
      }
      if (mechanics.length === 0) {
        await fetchMechanics();
      }
    };
    loadInitialData();
  }, []);

  // Load service data when editing and viewing
  useEffect(() => {
    if (!serviceID) return;

    const loadService = async () => {
      setIsLoading(true);
      try {
        const response = await fetchServiceById(parseInt(serviceID));
        if (response) {
          setService(response);

          // Set form values from response
          serviceForm.reset({
            serviceCode: response.serviceCode,
            customerID: String(response.customerID),
            vehicleID: String(response.vehicleID),
            mechanicID: String(response.mechanicID),
            currentMileage: response.currentMileage,
            serviceDate: new Date(response.serviceDate),
            maintenance: response.maintenance || defaultFormValues.maintenance,
            status: (response.status as "ACT" | "INA") || "ACT",
          });
        }
      } catch (error) {
        console.error("Error loading service:", error);
      } finally {
        setFiles([]);
        setIsLoading(false);
      }
    };

    loadService();
  }, [serviceID, serviceForm]);

  // Fetch vehicles when customer changes
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

  const onSubmit = async (_d: FormValues) => {
    const data = serviceForm.getValues();
    console.log("Form submitted with data:", data);
    const formData = new FormData();

    // Add basic fields
    formData.append("customerID", data.customerID);
    formData.append("vehicleID", data.vehicleID);
    formData.append("mechanicID", data.mechanicID);
    formData.append("currentMileage", data.currentMileage?.toString() ?? "0");
    formData.append("serviceDate", data.serviceDate.toISOString());
    formData.append("status", data.status || "ACT");
    formData.append("maintenance", JSON.stringify(data.maintenance));

    // Append files
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    formData.append("attachmentsRefs", JSON.stringify(service?.attachmentRefs || []));

    if (isNew) {
      await addService(formData);
    } else {
      await updateServiceData(formData);
    }
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

  // Helper function to render maintenance fields
  const renderMaintenanceFields = (
    sectionKey: string,
    subsectionKey: string,
    fields: { label: string; value: string; type: string; radioValues?: { label: string; value: string }[] }[]
  ) => {
    if (!fields || fields.length === 0) return null;

    return (
      <div className="space-y-2">
        {fields.map((field) => {
          const fieldPath = `maintenance.${sectionKey}.${subsectionKey}.${field.value}` as Path<FormValues>;

          switch (field.type) {
            case formFieldConstants.TEXT:
              return (
                <FormInput
                  key={field.value}
                  form={serviceForm}
                  name={fieldPath}
                  label={field.label}
                  type="text"
                  placeholder={'Type here...'}
                  disabled={serviceForm.formState.disabled}
                />
              );
            case formFieldConstants.RADIO_GROUP:
              return (
                <FormRadio
                  key={field.value}
                  form={serviceForm}
                  name={fieldPath}
                  label={field.label}
                  radioValues={field.radioValues!}
                  disabled={serviceForm.formState.disabled}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const maintenceTypes = Object.entries(constants.SERVICE_MAINTENANCE_TYPES);
  const { isSubmitting } = serviceForm.formState;
  const isNew = !service;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Add Service" : "View Service"}</h1>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        {!isLoading && !isLoadingCustomers && !isLoadingMechanics && (
          <Form {...serviceForm}>
            <form onSubmit={serviceForm.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6 pt-6">
                {/* Auto Care Code */}
                {service?.serviceID && (
                  <FormInput
                    form={serviceForm}
                    name="serviceCode"
                    label="Auto Care Code"
                    type="text"
                    required={true}
                    placeholder="This is generated automatically"
                    disabled={true}
                  />
                )}

                {/* Customer Selection */}
                <FormSelect 
                  form={serviceForm}
                  name="customerID"
                  label="Customer"
                  required={true}
                  placeholder="Select a customer"
                  options={customers.map((customer) => ({
                    value: customer.customerID.toString(),
                    label: `${customer.firstName} ${customer.lastName} (${customer.customerCode})`,
                  }))}
                  disabled={isSubmitting || !isNew}
                />

                {/* Vehicle Selection */}
                <FormSelect
                  form={serviceForm}
                  name="vehicleID"
                  label="Vehicle"
                  required={true}
                  placeholder={
                    serviceForm.watch("customerID") ? "Select a vehicle" : "Select a customer first"
                  }
                  options={vehicles.map((vehicle) => ({
                    value: vehicle.vehicleID.toString(),
                    label: `${vehicle.licensePlate} - ${vehicle.make} ${vehicle.model} (${vehicle.color})`,
                  }))}
                  disabled={!serviceForm.watch("customerID") || isSubmitting || !isNew}
                />

                {/* Mechanic Selection */}
                <FormSelect
                  form={serviceForm}
                  name="mechanicID"
                  label="Mechanic"
                  required={true}
                  placeholder="Select a mechanic"
                  options={mechanics.map((mechanic) => ({
                    value: mechanic.mechanicID.toString(),
                    label: `${mechanic.firstName} ${mechanic.lastName} (${mechanic.nic})`,
                  }))}
                  disabled={isSubmitting || !isNew}
                />

                {/* Current Mileage */}
                <FormInput
                  form={serviceForm}
                  name="currentMileage"
                  label="Current Mileage (km)"
                  type="number"
                  placeholder="Enter current mileage"
                  disabled={serviceForm.formState.disabled || isSubmitting}
                  inputProps={{
                    min: 0,
                  }}
                />

                {/* Service Date */}
                <FormField
                  control={serviceForm.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>
                        Service Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger disabled={serviceForm.formState.disabled} asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {section.subSections.map((subSection) => (
                          <div key={subSection.value} className="space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground block">
                              {subSection.label}
                            </Label>

                            <div className="grid grid-rows-[auto_1fr] gap-4">
                              {/* Maintenance Value Checkboxes */}
                              <FormCheckbox
                                form={serviceForm}
                                name={
                                  (sectionKey == "lubricants"
                                    ? `maintenance.${sectionKey}.${subSection.value}.values`
                                    : `maintenance.${sectionKey}.${subSection.value}`) as Path<FormValues>
                                }
                                options={Object.entries(constants.SERVICE_MAINTENANCE_VALUES).map(([key, value]) => ({
                                  id: key,
                                  label: value,
                                }))}
                                disabled={serviceForm.formState.disabled || isSubmitting}
                              />
                              {/* Additional maintenance fields Fields */}
                              {/* @ts-expect-error some sections may not have fields */}
                              {subSection.fields && renderMaintenanceFields(sectionKey, subSection.value, subSection.fields)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {sectionKey !== "filters" && <Separator />}
                    </div>
                  ))}
                </div>

                {/* File Upload */}
                <FileUpload
                  label="Upload Receipts & Attachments"
                  files={files}
                  onUploadFile={(files: File[]) => setFiles((prev) => [...prev, ...files])}
                  fileRefs={service?.attachmentRefs || []}
                  disabled={serviceForm.formState.disabled || isSubmitting}
                />

                {/* Status */}
                <FormSelect
                  form={serviceForm}
                  name="status"
                  label="Status"
                  required={true}
                  placeholder="Select status"
                  options={[
                    { value: "ACT", label: "Active" },
                    { value: "INA", label: "Inactive" },
                  ]}
                  disabled={isSubmitting}
                />
              </CardContent>

              <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    serviceForm.reset(defaultFormValues);
                    setFiles([]);
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

        {isLoading ||
          isLoadingCustomers ||
          (isLoadingMechanics && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ))}
      </div>
    </div>
  );
};

export default AddEditService;
