import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchJobConfig } from "./Utills";

const JobConfig = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      const fetchedJobs = await fetchJobConfig();
      setJobs(fetchedJobs);
    };

    loadJobs();
  }, []);

  // const handleRowClick = (jobID: number) => {
  //   navigate(`/job-config/${jobID}`);
  // };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Job Configuration</h1>
        <Button className="ml-4">Add</Button>
      </div>
      <div>
        <Table>
          <TableCaption>A list of Jobs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Job Code</TableHead>
              <TableHead>Job Name</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow
                  key={job.jobID}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell className="font-medium">{job.jobCode}</TableCell>
                  <TableCell>{job.jobName}</TableCell>
                  <TableCell className="text-right">{job.status}</TableCell>
                  <Link to={`:${job.jobID}`}>
                    <TableCell>View</TableCell>
                  </Link>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default JobConfig;
