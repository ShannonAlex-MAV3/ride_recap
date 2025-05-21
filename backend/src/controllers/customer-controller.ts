import { Customer } from "../@types";
import logger from "../logger";
import * as customerService from "../services/customer/service";
import { Request, Response } from "express";

export const getAllCustomers = async (req: Request, res: Response) => {

  logger.info("Start: get all the job configs");

  try {
    const customers = await customerService.getAllCustomers();

    res.json(customers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: get all the job configs");

};

export const saveCustomer = async (req: Request, res: Response) => {

  logger.info("Start: create new customer.");

  try {
    const newCustomer: Customer = req.body;
    const customer = await customerService.saveCustomer(newCustomer); //TODO custom validation

    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: create new customer.");

};

export const getJCustomerById = async (req: Request, res: Response) => {

  logger.info("Start: get customer by id: ", req.params.customerID);

  try {
    const customerId = parseInt(req.params.customerID, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const customer = await customerService.getCustomerById(customerId);
    res.json(customer);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: get customer by id :", req.params.customerID);

}; // get customer without vehicle?

export const updateCustomer = async (req: Request, res: Response) => {

  logger.info("Start: update customer.");

  try {
    const customer: Customer = req.body;
    const updatedCustomer = await customerService.updateCustomer(customer);

    res.status(200).json(updatedCustomer);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: update customer.");
};


export const getVehiclesByCustomerId = async (req: Request, res: Response) => {
  logger.info("Start: get vehicles by customer id: ", req.params.customerID);

  try {
    const customerId = parseInt(req.params.customerID, 10);
    if (isNaN(customerId)) {
      return res.status(400).json({ message: "Invalid Customer" });
    }

    const vehicles = await customerService.getVehiclesByCustomerId(customerId);
    res.json(vehicles);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
    logger.error("Error", { message: (error as Error).message, stack: (error as Error).stack });
  }

  logger.info("End: get vehicles by customer id :", req.params.customerID);

}