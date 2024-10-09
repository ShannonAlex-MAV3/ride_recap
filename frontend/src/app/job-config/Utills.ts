// all the functions that are used in job-config
export interface JobConfig {
  jobID: number;
  jobCode: string;
  jobName: string;
  status: string;
}

export const fetchJobConfig = async (): Promise<JobConfig[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockJobs = [
        { jobID: 1, jobCode: "JB001", jobName: "Oil Change", status: "ACT" },
        { jobID: 2, jobCode: "JB002", jobName: "Oil Change", status: "ACT" },
        {
          jobID: 3,
          jobCode: "JB003",
          jobName: "Brake Inspection",
          status: "INA",
        },
      ];
      resolve(mockJobs);
    }, 1000);
  });
};

// export const handleRowClick = (jobCode: string) => {
//   console.log("HandleRowClick: jobCode -->", jobCode);
//   //   const navigate = useNavigate();
//   //   navigate(`/jobs/${jobCode}`); // Navigate to the Job Detail page
// };
