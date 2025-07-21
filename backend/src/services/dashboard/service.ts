import { PrismaClient } from "@prisma/client";
import logger from "../../logger";
import { RepairWithDetails } from "../../@types";

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

type JobWiseAutoCare = {
    name: string;
    value: number;
};

export const getMaintenanceTrend = async (): Promise<JobWiseAutoCare[]> => {
    logger.info("Start: Fetching maintenance job trend.");

    const result: any[] = await prisma.$queryRaw<JobWiseAutoCare[]>
        `
            SELECT 
                jb."jobName" AS "name",
                COUNT(r."repairID") AS "value"
            FROM "Repair" r
            INNER JOIN "JobConfig" AS jb ON r."jobID" = jb."jobID"
            WHERE r."status" = 'ACT'
            GROUP BY r."jobID", jb."jobName";
        `;

    // Convert BigInt values to numbers
    const formattedResult: JobWiseAutoCare[] = result.map(row => ({
        name: row.name,
        value: Number(row.value),  // <-- Convert here
    }));

    logger.info(`End: Fetched maintenance job trend`);

    return formattedResult ?? [];
}

type LatestRepairs = {
    repairID: number
    repairCode: string;
    jobCode: string;
    jobName: string;
    firstName: string;
    lastName: string;
    licensePlate: string;
};

export const getLatestRepairs = async (): Promise<LatestRepairs[]> => {
    logger.info("Start: Fetching latest repairs.");

    const result: any[] = await prisma.$queryRaw<LatestRepairs[]>
        `
            SELECT 
                r."repairID",
                r."repairCode",
                j."jobCode",
                j."jobName",
                c."firstName",
                c."lastName",
                v."licensePlate"
            FROM "Repair" r
            INNER JOIN "Customer" c ON r."customerID" = c."customerID"
            INNER JOIN "Vehicle" v ON c."customerID" = v."customerID"
            INNER JOIN "JobConfig" j ON r."jobID" = j."jobID"
            WHERE r."status" = 'ACT'
            ORDER BY r."createdAt" DESC
            LIMIT 5;
        `;

    // Convert BigInt values to numbers
    const formattedResult: LatestRepairs[] = result.map(row => ({
        repairID: row.repairID,
        repairCode: row.repairCode,
        jobCode: row.jobCode,
        jobName: row.jobName,
        firstName: row.firstName,
        lastName: row.lastName,
        licensePlate: row.licensePlate,
    }));

    logger.info(`End: Fetched latest repairs`);

    return formattedResult ?? [];
}

type RepairsByJobs = {
    category: string;
    count: number
};

export const getRepairsByJobCategory = async (): Promise<RepairsByJobs[]> => {

    logger.info("Start: Fetching repair details by jobs for Dashboard.");

    const repairsWithJob = await prisma.repair.findMany({
        select: {
            jobID: true,
        },
    });

    const jobs = await prisma.jobConfig.findMany({
        select: {
            jobID: true,
            jobName: true,
        },
    });

    // Create a mapping of jobID -> jobName
    const jobNameMap = Object.fromEntries(jobs.map(job => [job.jobID, job.jobName]));

    // Count repairs grouped by jobName
    const jobNameCountMap: Record<string, number> = {};

    repairsWithJob.forEach(({ jobID }) => {
        const jobName = jobNameMap[jobID];
        if (jobName) {
            jobNameCountMap[jobName] = (jobNameCountMap[jobName] || 0) + 1;
        }
    });

    // Final formatted array
    const jobCategoryData = Object.entries(jobNameCountMap).map(([jobName, count]) => ({
        category: jobName,
        count,
    }));

    logger.info(`End: Start: Fetching repair details by jobs for Dashboard.`);

    return jobCategoryData ?? [];
}