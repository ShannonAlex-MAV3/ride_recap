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
import { Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchJobConfig,
  getStatusEnumColor,
  getStatusEnumValue,
  JobConfig,
} from "./Utills";
import { Badge } from "@/components/ui/badge";

const JobConfigBase = () => {
  const [jobs, setJobs] = useState<JobConfig[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const fetchedJobs = await fetchJobConfig();
      setJobs(fetchedJobs);
    };

    loadJobs();
  }, []);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Job Configuration</h1>
        <Button className="ml-4">
          <Link to={`new`}>Add</Link>
        </Button>
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
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
                      <Badge variant={getStatusEnumColor(job.status)}>
                        {getStatusEnumValue(job.status)}
                      </Badge>
                      {/* ToDo add something like tag */}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${job.jobID}`}>
                        <Pen className="h-4 w-4 hover:text-blue-500" />
                      </Link>
                    </TableCell>
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

export default JobConfigBase;
