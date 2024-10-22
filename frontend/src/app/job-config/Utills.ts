import { z } from "zod";

// all the functions that are used in job-config
export interface JobConfig {
  jobID: number;
  jobCode: string;
  jobName: string;
  description: string;
  category: JobCategories;
  status: string;
}

export enum JobCategories {
  GM = "General Maintenance",
  ID = "Inspections and Diagnostics",
  ER = "Engine Repair & Maintenance",
  BS = "Brakes and Suspension",
  TS = "Transmission Services",
  AC = "HVAC (Heating, Ventilation, Air Conditioning)",
  BP = "Body and Paintwork",
  TW = "Tires and Wheels",
}

export enum Status {
  ACT = "Active",
  INA = "Inactive",
}

export const fetchJobConfig = async (): Promise<JobConfig[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockJobs = [
        {
          jobID: 1,
          jobCode: "JB001",
          jobName: "Oil Change",
          status: "ACT",
          description: "Test Data",
          category: "GM",
        },
        {
          jobID: 2,
          jobCode: "JB002",
          jobName: "Oil Change",
          status: "ACT",
          description: "Test Data",
          category: "GM",
        },
        {
          jobID: 3,
          jobCode: "JB003",
          jobName: "Brake Inspection",
          status: "INA",
          description: "Test Data",
          category: "GM",
        },
      ];
      resolve(mockJobs);
    }, 1000);
  });
};

export const formSchema = z.object({
  //ToDo: understand
  jobCode: z.string().nullable().optional(),
  jobName: z.string().min(2).max(50),
  description: z.string().min(2).max(255),
  category: z.string().min(2).max(50),
  status: z.string().min(2).max(50),
});

export const submitJob = (formVals: any) => {
  console.log("Form vals: ", formVals);
};

export const getCategoryEnumValue = (category: string) => {
  return JobCategories[category as keyof typeof JobCategories];
};

export const getStatusEnumValue = (status: string) => {
  return Status[status as keyof typeof Status];
};

// export const handleRowClick = (jobCode: string) => {
//   console.log("HandleRowClick: jobCode -->", jobCode);
//   //   const navigate = useNavigate();
//   //   navigate(`/jobs/${jobCode}`); // Navigate to the Job Detail page
// };
