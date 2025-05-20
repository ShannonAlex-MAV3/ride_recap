import { ColumnDef } from "@tanstack/react-table";
import { BellIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define Type
type MaintenanceItem = {
  vehicle: string;
  job: string;
  dueDate: string;
  dueKm: number;
  action: "notify" | "view";
};

// Sample Data
const data: MaintenanceItem[] = [
  {
    vehicle: "ABC-1234",
    job: "Oil Change",
    dueDate: "2025-05-25",
    dueKm: 500,
    action: "notify",
  },
  {
    vehicle: "XYZ-5678",
    job: "Brake Check",
    dueDate: "2025-06-01",
    dueKm: 1000,
    action: "view",
  },
  {
    vehicle: "ABC-1234",
    job: "Oil Change",
    dueDate: "2025-05-25",
    dueKm: 500,
    action: "notify",
  },
  {
    vehicle: "XYZ-5678",
    job: "Brake Check",
    dueDate: "2025-06-01",
    dueKm: 1000,
    action: "view",
  },{
    vehicle: "ABC-1234",
    job: "Oil Change",
    dueDate: "2025-05-25",
    dueKm: 500,
    action: "notify",
  }
];

// Define Columns
const columns: ColumnDef<MaintenanceItem>[] = [
  {
    accessorKey: "vehicle",
    header: "Vehicle",
  },
  {
    accessorKey: "job",
    header: "Job",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "dueKm",
    header: "Due in (km)",
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.original.action;
      return action === "notify" ? (
        <Button
          variant="ghost"
          className="text-yellow-500 hover:bg-yellow-500/10"
        >
          <BellIcon className="w-4 h-4 mr-1" /> Notify
        </Button>
      ) : (
        <Button variant="ghost" className="text-blue-400 hover:bg-blue-400/10">
          <EyeIcon className="w-4 h-4 mr-1" /> View
        </Button>
      );
    },
  },
];

// Component
export default function UpcomingMaintenanceTable() {
  return (
    <Card>
      <CardHeader >
        <CardTitle>
          <span className="mr-2">📅</span> Upcoming Maintenance Jobs
        </CardTitle>
        <CardDescription>
          A table showing jobs that are coming due (by date or km):
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} />
      </CardContent>
    </Card>
  );
}
