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
import { fetchJobConfig, getStatusEnumValue } from "./Utills";
import { Home, Pen } from "lucide-react";

const JobConfig = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);
  // const navigate = useNavigate();

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
        <Button className="ml-4">
          <Link to={`new`}>Add</Link>
        </Button>
      </div>
      <div
            className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm"
          >
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
                  <TableCell className="text-right">
                    {getStatusEnumValue(job.status)}
                    {/* ToDo add something like tag */}
                  </TableCell>
                  <Link to={`${job.jobID}`}>
                    <TableCell>
                      <Pen className="h-4 w-4" />
                    </TableCell>
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
      </div>
    </>
  );
};

export default JobConfig;
