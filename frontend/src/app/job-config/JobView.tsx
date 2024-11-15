import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchJobConfig,
  getCategoryEnumValue,
  getStatusEnumValue,
  JobConfig,
} from "./Utills";
import { Button } from "@/components/ui/button";

const JobView = () => {
  const { jobID } = useParams<{ jobID: string }>();
  const [job, setJob] = useState<JobConfig | null>(null);
  const [loading, setLoading] = useState(true);
  //@ts-ignore
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      const jobs = await fetchJobConfig();
      const jobData = jobs.find((j) => j.jobID === Number(jobID));
      setJob(jobData || null);
      setLoading(false);
    };
    loadJobs();
  }, [jobID]);

  if (loading) {
    return <div>Loading job details...</div>;
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Job Details</h1>
      <div className="flex items-center pt-2 pb-2">
        <div className="mr-2">
          <p>
            <span>Details for :</span>
            <span className="text-xl font-bold"> {job.jobName}</span>
          </p>
        </div>
        <div>
          <Button onClick={() => setIsEdit(true)}>Edit Job</Button>
        </div>
      </div>

      {true && (
        <div className="pt-6">
          <p className="pt-2 flex">
            <strong className="w-1/5">Job Name:</strong> {job.jobName}
          </p>
          <p className="pt-2 flex">
            <strong className="w-1/5">Description:</strong> {job.description}
          </p>
          <p className="pt-2 flex">
            <strong className="w-1/5">Category:</strong>
            {getCategoryEnumValue(job.category)}
          </p>
          <p className="pt-2 flex">
            <strong className="w-1/5">Status:</strong>{" "}
            {getStatusEnumValue(job.status)}
          </p>
        </div>
      )}

      {/* In a real app, you'd fetch job details by jobCode from backend here */}
      {/* Example: useEffect(() => { fetchJobDetails(jobCode); }, [jobCode]); */}
    </div>
  );
};

export default JobView;
