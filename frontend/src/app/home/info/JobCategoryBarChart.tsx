import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchJobWiseRepairsForDSB, RepairsByJobs } from "./Util";

// const jobCategoryData = [
//   { category: "Oil Change", count: 12 },
//   { category: "Brakes", count: 8 },
//   { category: "Battery", count: 5 },
//   { category: "AC Repair", count: 3 },
// ];

export function JobCategoryBarChart() {
  const [jobCategoryData, setJobCategoryData] = useState<RepairsByJobs[]>([]);

  useEffect(() => {
    const loadJobWiseRepairs = async () => {
      const res = await fetchJobWiseRepairsForDSB();
      setJobCategoryData(res);
    };

    loadJobWiseRepairs();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-md font-semibold mb-2">Repairs by Job Category</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={jobCategoryData}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
