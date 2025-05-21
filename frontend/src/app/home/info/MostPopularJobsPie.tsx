// PieChartPanel.jsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { MaintenanceTrendingJobsDSB, fetchTrendingJobsForDSB } from "./Util";

const JobTrendPiePanel = () => {
  const [trendingJobs, setTrendingJobs] = useState<
    MaintenanceTrendingJobsDSB[]
  >([]);

  useEffect(() => {
    const loadJobs = async () => {
      const trendJobs = await fetchTrendingJobsForDSB();
      setTrendingJobs(trendJobs);
    };

    loadJobs();
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Job Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trendingJobs}
                cx="50%"
                cy="50%"
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
                label
              >
                {trendingJobs.map((entry, index) => {
                  const randomColor = `#${Math.floor(Math.random() * 16777215)
                    .toString(16)
                    .padStart(6, "0")}`;
                  return <Cell key={`cell-${index}`} fill={randomColor} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default JobTrendPiePanel;
