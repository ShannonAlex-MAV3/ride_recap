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

  // Be cautious of potential concurrency issues. If multiple records are being created simultaneously, this approach could lead to duplicate job codes.
  const latestCustomer = await getLatestCustomer();

  const latestCustomerID = latestCustomer?.customerID || 0;

  const newCustomerCode = createCustomerCode(latestCustomerID);
  logger.info(`Generated customer code: ${newCustomerCode}`);

  const newCustomer = {
    customerCode: newCustomerCode,
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: customer.email.trim(),
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

  const updatedCustomer = await prisma.customer.update({
    where: {
      customerID: customer.customerID,
    },
    data: {
      firstName: customer.firstName.trim(),
      lastName: customer.lastName.trim(),
      email: customer.email.trim(),
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