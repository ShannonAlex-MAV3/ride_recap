import { PrismaClient } from "@prisma/client";
import logger from "../../logger";

const prisma = new PrismaClient();

export const getTotalCustomers = async (): Promise<{
    totalCustomers: number;
    totalCustomersForCurrentMonth: number;
}> => {
    logger.info("Start: Fetching total customers.");

    const date = new Date();

    const totalCustomerQuery = await prisma.$queryRaw<{ active_customers: number }[]>
        `
            SELECT COUNT(*) AS active_customers
            FROM "Customer"
            WHERE status = 'ACT';
        `;

    const totalCustomerForThisMonthQuery = await prisma.$queryRaw<{ customers_this_month: number }[]>
        `
            SELECT COUNT(*) AS customers_this_month
            FROM "Customer"
            WHERE DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', ${date})
            AND status = 'ACT';
        `;

    const totalCustomers = Number(totalCustomerQuery[0]?.active_customers ?? 0);
    const totalCustomersForCurrentMonth = Number(totalCustomerForThisMonthQuery[0]?.customers_this_month ?? 0);

    logger.info(`End: Fetched total customers ${totalCustomers} & customers for current month ${totalCustomersForCurrentMonth} `);

    return {
        totalCustomers,
        totalCustomersForCurrentMonth,
    };
}

export const getTotalVehicles = async (): Promise<{
    totalVehicles: number;
    totalVehiclesForCurrentMonth: number;
}> => {
    logger.info("Start: Fetching total vehicles.");

    const date = new Date();

    const totalVehiclesQuery = await prisma.$queryRaw<{ active_vehicles: number }[]>
        `
            SELECT COUNT(*) AS active_vehicles
            FROM "Vehicle"
            WHERE status = 'ACT';
        `;

    const totalVehiclesForThisMonthQuery = await prisma.$queryRaw<{ vehicles_this_month: number }[]>
        `
            SELECT COUNT(*) AS vehicles_this_month
            FROM "Vehicle"
            WHERE DATE_TRUNC('month', "createdAt") = DATE_TRUNC('month', ${date})
            AND status = 'ACT';
        `;

    const totalVehicles = Number(totalVehiclesQuery[0]?.active_vehicles ?? 0);
    const totalVehiclesForCurrentMonth = Number(totalVehiclesForThisMonthQuery[0]?.vehicles_this_month ?? 0);

    logger.info(`End: Fetched total customers ${totalVehicles} & customers for current month ${totalVehiclesForCurrentMonth} `);

    return {
        totalVehicles,
        totalVehiclesForCurrentMonth,
    };
}