import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { fetchLatestRepairsForDSB, LatestRepairsDSB } from "./Util";
import { useNavigate } from "react-router-dom";

// Component
export default function LatestRepairsTable() {
  const [latestRepairs, setLatestRepairs] = useState<LatestRepairsDSB[]>([]);
  const navigate = useNavigate();

  // Define Columns
  const columns: ColumnDef<LatestRepairsDSB>[] = [
    {
      accessorKey: "repairCode",
      header: "Repair Code",
    },
    {
      accessorKey: "jobName",
      header: "Job",
    },
    {
      accessorKey: "licensePlate",
      header: "Vehicle",
    },
    {
      accessorKey: "firstName",
      header: "Customer First Name",
    },
    {
      accessorKey: "lastName",
      header: "Customer Last Name",
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          className="text-blue-400 hover:bg-blue-400/10"
          onClick={() => {
            // example: navigate to details page
            const repairId = row.original.repairID;
            console.log("View repair", repairId);
            navigate(`/repair/${repairId}`);
          }}
        >
          <EyeIcon className="w-4 h-4 mr-1" /> View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const loadLatestRepairs = async () => {
      const res = await fetchLatestRepairsForDSB();
      setLatestRepairs(res);
    };

    loadLatestRepairs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="mr-2">🛠️</span> Latest Repairs
        </CardTitle>
        <CardDescription>
          Recently created repair records (latest 5):
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={latestRepairs} />
      </CardContent>
    </Card>
  );
}
