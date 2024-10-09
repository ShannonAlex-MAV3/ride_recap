import { useParams } from "react-router-dom";

const JobView = () => {
  const { jobID } = useParams<{ jobID: number }>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Job Details</h1>
      <p>Details for job code: {jobID}</p>

      {/* In a real app, you'd fetch job details by jobCode from backend here */}
      {/* Example: useEffect(() => { fetchJobDetails(jobCode); }, [jobCode]); */}
    </div>
  );
};

export default JobView;
