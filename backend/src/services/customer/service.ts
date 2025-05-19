import { PrismaClient } from "@prisma/client";
import { Customer, Vehicle } from "../../@types";
import { createCustomerCode } from "../customer/support"
import logger from "../../logger";

const prisma = new PrismaClient();

export const getAllCustomers = async (): Promise<Customer[]> => {
  logger.info("Start: Fetching all Customers");

  const customers = await prisma.customer.findMany({
    // include: {
    //   vehicles: true,
    // },
  });

  logger.info(`End: Fetched ${customers.length} Customers.`);

  return customers;
};

export const saveCustomer = async (customer: Customer): Promise<Customer> => {
  logger.info("Start: Saving new customer.");

  const seenPlates = new Set<string>();
  
  // Be cautious of potential concurrency issues. If multiple records are being created simultaneously, this approach could lead to duplicate job codes.
  const latestCustomer = await getLatestCustomer();

  const latestCustomerID = latestCustomer?.customerID || 0;

  const newCustomerCode = createCustomerCode(latestCustomerID);
  logger.info(`Generated customer code: ${newCustomerCode}`);

  const emailTrimmed = customer.email.trim();

  await validateUniqueCustomerEmail(emailTrimmed);

  // Check vehicle license plates for duplicates
  if (customer.vehicles && customer.vehicles.length > 0) {
    for (const vehicle of customer.vehicles) {
      const licensePlateTrimmed = vehicle.licensePlate.trim();

      if (seenPlates.has(licensePlateTrimmed)) {
        throw new Error(`Please check for duplicated License Plate Numbers '${licensePlateTrimmed}'.`);
      }

      seenPlates.add(licensePlateTrimmed);

      await validateUniqueLicensePlate(licensePlateTrimmed)
    }
  }

  const newCustomer = {
    customerCode: newCustomerCode,
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: emailTrimmed,
    phone: customer.phone.trim(),
    address: customer.address.trim(),
    status: customer.status,
  };

  let newVehicles: Vehicle[] = [];

  if (customer.vehicles && customer.vehicles.length > 0) {
    newVehicles = customer.vehicles.map(vehicle => ({
      licensePlate: vehicle.licensePlate.trim(),
      make: vehicle.make.trim(),
      model: vehicle.model.trim(),
      year: vehicle.year,
      color: vehicle.color.trim(),
      status: vehicle.status,
    }));
  }

  const savedCustomer = await prisma.customer.create({
    data: {
      ...newCustomer,
      vehicles: {
        create: newVehicles,
      },
    },
    include: { vehicles: true }, // Optional, if you want vehicles in the response
  });

  logger.info("End: Saved new customer.", savedCustomer);

  return savedCustomer;
};

export const getLatestCustomer = async (): Promise<Customer | null> => {
  logger.info("Start: Fetching latest Customer.");

  const latestCustomer = await prisma.customer.findFirst({
    orderBy: { customerID: "desc" },
  });

  logger.info("End: Fetched latest Customer.", latestCustomer);

  return latestCustomer;
};

export const getCustomerById = async (
  customerID: number
): Promise<Customer | null> => {
  logger.info(`Start: Fetching customer by ID: ${customerID}`);

  const customer = await prisma.customer.findUnique({
    where: {
      customerID: customerID,
    },
    include: {
      vehicles: true,
    },
  });

  logger.info(`End: Fetched customer: ${customer}`);

  return customer;
};

export const updateCustomer = async (customer: Customer): Promise<Customer> => {
  logger.info("Start: Updating customer.");

  const seenPlates = new Set<string>();

  const customerId = customer.customerID;
  const trimmedEmail = customer.email.trim();

  await validateUniqueCustomerEmail(trimmedEmail, customerId);

  if (customer.vehicles && customer.vehicles.length > 0) {
    for (const vehicle of customer.vehicles) {
      const trimmedPlate = vehicle.licensePlate.trim();

      if (seenPlates.has(trimmedPlate)) {
        throw new Error(`Please check for duplicated License Plate Numbers '${trimmedPlate}'.`);
      }

      seenPlates.add(trimmedPlate);

      // Skip validation for existing vehicle with unchanged plate
      if (vehicle.vehicleID) {
        // Validate the updated ones
        const existing = await prisma.vehicle.findUnique({
          where: { vehicleID: vehicle.vehicleID },
        });

        if (existing && existing.licensePlate === trimmedPlate) {
          continue; // no change in plate, skip validation
        } else {
          await validateUniqueLicensePlate(trimmedPlate, vehicle.vehicleID)
        }
      } else {
        // Validate the new ones -- upsert
        await validateUniqueLicensePlate(trimmedPlate)
      }
    }
  }

  const updatedCustomer = await prisma.customer.update({
    where: {
      customerID: customerId,
    },
    data: {
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      email: trimmedEmail,
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      status: customer.status,
      updatedAt: new Date(),
      vehicles: {
        upsert: customer.vehicles?.map(vehicle => ({
          where: {
            vehicleID: vehicle.vehicleID ?? 0, // required field for `upsert`
          },
          update: {
            licensePlate: vehicle.licensePlate.trim(),
            make: vehicle.make.trim(),
            model: vehicle.model.trim(),
            year: vehicle.year,
            color: vehicle.color.trim(),
            status: vehicle.status,
            updatedAt: new Date(),
          },
          create: {
            licensePlate: vehicle.licensePlate.trim(),
            make: vehicle.make.trim(),
            model: vehicle.model.trim(),
            year: vehicle.year,
            color: vehicle.color.trim(),
            status: vehicle.status,
          },
        })) || [],
      },
    },
    include: {
      vehicles: true,
    },
  });

  logger.info("End: Update customer for.", updatedCustomer.customerCode);

  return updatedCustomer;
};

export const validateUniqueCustomerEmail = async (email: string, excludeCustomerID?: number): Promise<void> => {

  const trimmedEmail = email.trim();

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      email: trimmedEmail,
      ...(excludeCustomerID ? { NOT: { customerID: excludeCustomerID } } : {}),
    },
  });

  if (existingCustomer) {
    throw new Error("A customer with this email already exists.");
  }
};

export const validateUniqueLicensePlate = async (plate: string, excludeVehicleID?: number): Promise<void> => {

  const trimmedLicense = plate.trim();

  const existingVehicle = await prisma.vehicle.findFirst({
    where: {
      licensePlate: trimmedLicense,
      ...(excludeVehicleID ? { NOT: { vehicleID: excludeVehicleID } } : {}),
    },
  });

  if (existingVehicle) {
    throw new Error(`A vehicle with license plate '${trimmedLicense}' already exists.`);
  }
};