//@ts-nocheck
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  customerFormSchema,
  vehicleFormSchema,
  createCustomer,
  updateCustomer,
  getCustomerByID,
} from "./Util";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import VehicleBase from "./vehicle/Vehicle";
import { useParams, useNavigate } from "react-router-dom";
import { Customer, Vehicle } from "@/@types";

const AddEditCustomer = () => {
  const { customerID } = useParams<{ customerID: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [editingVehicleIndex, setEditingVehicleIndex] = useState<number | null>(
    null
  );

  const navigate = useNavigate();

  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerCode: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      status: "",
    },
  });

  const defaultVehicleValues = {
    licensePlate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    status: "",
  };

  const vehicleForm = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: defaultVehicleValues,
  });

  useEffect(() => {
    if (customerID) {
      setIsEditing(true);
      const loadCustomer = async () => {
        const customerToEdit = await getCustomerByID(customerID);
        if (customerToEdit) {
          setCustomerData(customerToEdit);
          customerForm.reset({
            customerCode: customerToEdit.customerCode,
            firstName: customerToEdit.firstName,
            lastName: customerToEdit.lastName,
            email: customerToEdit.email,
            phone: customerToEdit.phone,
            address: customerToEdit.address,
            status: customerToEdit.status,
          });
          setVehicleList(customerToEdit.vehicles);
        }
      };
      loadCustomer();
    } else {
      setIsEditing(false);
    }
  }, [customerID]);

  const submitCustomer = async (formVals: any) => {
    const updateRQ = {
      ...customerData,
      ...formVals,
      vehicles: vehicleList,
    };

    if (isEditing) {
      const updatedCustomer = await updateCustomer(updateRQ);
      setCustomerData(updatedCustomer);
      setVehicleList(updatedCustomer.vehicles);

      customerForm.reset({
        customerCode: updatedCustomer.customerCode,
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        status: updatedCustomer.status,
      });
    } else {
      const newCustomer = await createCustomer(updateRQ);
      navigate(`/customer/${newCustomer.customerID}`);
    }
  };

  const submitVehicle = (formVals: z.infer<typeof vehicleFormSchema>) => {
    setVehicleList((prev) => {
      const updated = [...prev];

      if (editingVehicleIndex !== null) {
        // ✅ Editing existing vehicle - merge to preserve vehicleID, customerID, etc.
        updated[editingVehicleIndex] = {
          ...updated[editingVehicleIndex], // keep existing values like vehicleID
          ...formVals, // overwrite with updated form values
        };
      } else {
        // ✅ Adding new vehicle - optionally auto-assign a status if needed
        updated.push({
          ...formVals,
          status: formVals.status || "ACT", // optional default if your schema allows it
        });
      }

      return updated;
    });

    // ✅ Reset state after submit
    setEditingVehicleIndex(null);
    setIsAddVehicleModalOpen(false);
  };

  const handleModalChange = (isOpen: boolean) => {
    setIsAddVehicleModalOpen(isOpen);
    if (!isOpen) {
      setEditingVehicleIndex(null); // Reset when closing
    }
  };

  useEffect(() => {
    if (isAddVehicleModalOpen) {
      if (editingVehicleIndex !== null) {
        vehicleForm.reset(vehicleList[editingVehicleIndex]);
      } else {
        vehicleForm.reset(defaultVehicleValues);
      }
    }
  }, [isAddVehicleModalOpen, editingVehicleIndex]);

  return (
    <>
      <div className="p-2">
        <h1 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Customer" : "Add New Customer"}
        </h1>

        <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
          <Form {...customerForm}>
            <form
              className="space-y-4"
              onSubmit={customerForm.handleSubmit(submitCustomer)}
            >
              {/* Customer Code */}
              <FormField
                control={customerForm.control}
                name="customerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Customer Code
                    </FormLabel>
                    <Input
                      {...field}
                      className="mt-1 block w-4/5 rounded-md border-gray-300 shadow-sm"
                      disabled
                      placeholder="Code will auto generated."
                    />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={customerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-4/5"
                        placeholder="Enter first name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={customerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-4/5"
                        placeholder="Enter last name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-4/5"
                        placeholder="Enter email address"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-4/5"
                        placeholder="Enter phone number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={customerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-4/5"
                        placeholder="Enter address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={customerForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Status
                    </FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
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

              {/* Add Vehicle Panel */}
              <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center justify-between w-full">
                        <span>Add Vehicle</span>
                        <Button
                          type="button"
                          size="sm"
                          className="mr-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddVehicleModalOpen(true);
                          }}
                        >
                          + Add
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div>
                        <VehicleBase
                          vehicles={vehicleList}
                          onEditVehicle={(index) => {
                            setEditingVehicleIndex(index); // store index in state
                            setIsAddVehicleModalOpen(true); // open modal
                          }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Customer Form Buttons */}
              <div className="flex space-x-4">
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    isEditing
                      ? !customerForm.formState.isDirty &&
                        !vehicleForm.formState.isDirty
                      : !customerForm.formState.isValid ||
                        vehicleList.length === 0
                  }
                >
                  {isEditing ? "Update Customer" : "Add Customer"}
                </Button>

                {/* Clear Button */}
                <Button
                  type="reset"
                  className="btn btn-secondary"
                  onClick={() =>
                    customerForm.reset({
                      customerCode: customerData?.customerCode ?? "",
                      firstName: customerData?.firstName ?? "",
                      lastName: customerData?.lastName ?? "",
                      email: customerData?.email ?? "",
                      phone: customerData?.phone ?? "",
                      address: customerData?.address ?? "",
                      status: customerData?.status ?? "",
                    })
                  }
                >
                  Discard
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={isAddVehicleModalOpen} onOpenChange={handleModalChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Vehicle </DialogTitle>
            <DialogDescription>
              Enter vehicle details for this customer.
            </DialogDescription>
          </DialogHeader>

          <Form {...vehicleForm}>
            <form
              onSubmit={vehicleForm.handleSubmit(submitVehicle)}
              className="space-y-4"
            >
              <FormField
                control={vehicleForm.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACT">Active</SelectItem>
                        <SelectItem value="INA">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={
                    isEditing
                      ? !vehicleForm.formState.isDirty
                      : !vehicleForm.formState.isValid
                  }
                  onClick={() => setIsAddVehicleModalOpen(false)}
                >
                  Save Vehicle
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddEditCustomer;
