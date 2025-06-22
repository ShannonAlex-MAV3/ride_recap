import { RepairWithDetails } from "@/@types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Pen } from "lucide-react";
import { getStatusEnumColor, getStatusEnumValue } from "../common/Utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fetchRepairsWithDetails, RepairSearchFilters } from "./Util";
import Search from "../services/Search";
// import { useMasterStore } from "@/hooks/use-master-store";

const RepairBase = () => {
  const [repairs, setRepairs] = useState<RepairWithDetails[]>([]);

  const getRepairs = useCallback(async (filters?: RepairSearchFilters) => {
    const response = await fetchRepairsWithDetails(filters);
    setRepairs(response);
  }, []);

  useEffect(() => {
    getRepairs();
  }, [getRepairs]);

  return (
    <>
      <div className="flex space-y-4 justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Repair</h1>
            <Button className="ml-4">
              <Link to={`new`}>Add</Link>
            </Button>
          </div>
        </div>
        <Search onSearch={getRepairs} />
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div>
          <Table>
            <TableCaption>A list of Repair History.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Repair Code</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairs.length > 0 ? (
                repairs.map((repair) => (
                  <TableRow
                    key={repair.repairID}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {repair.repairCode}
                    </TableCell>
                    <TableCell className="font-medium">
                      {repair.licensePlate}
                    </TableCell>
                    <TableCell className="font-medium">
                      <TableCell>
                        {repair.firstName} {repair.lastName} (
                        {repair.customerCode})
                      </TableCell>
                    </TableCell>
                    <TableCell className="font-medium">
                      {repair.jobName} ({repair.jobCode})
                    </TableCell>
                    <TableCell className="font-medium">
                      {repair.createdAt
                        ? new Date(repair.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusEnumColor(repair.status!)}>
                        {getStatusEnumValue(repair.status!)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${repair.repairID}`}>
                        <Pen className="h-4 w-4 hover:text-blue-500" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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

export default RepairBase;
