import { AutoCare } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatusEnumColor, getStatusEnumValue } from "../common/Utils";
import { calNextValue, fetchAutoCares } from "./util";
import { Card } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { constants } from "@/constants";

const AutoCareBase = () => {
  const [autoCares, setAutoCares] = useState<AutoCare[]>([]);

  const getAutoCares = useCallback(async () => {
    const response = await fetchAutoCares();
    setAutoCares(response);
  }, []);

  useEffect(() => {
    getAutoCares();
  }, [getAutoCares]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Auto Care</h1>
        {autoCares.length > 0 && (
          <Button className="ml-4">
            <Link to={`new`}>Add</Link>
          </Button>
        )}
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div>
          <Table>
            <TableCaption>A list of Auto Cares.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Auto Care Code</TableHead>
                <TableHead className="w-[30%]">Jobs</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autoCares.length > 0 ? (
                autoCares.map((autoCare) => (
                  <TableRow key={autoCare.autoCareID} className="cursor-pointer hover:bg-gray-100">
                    <TableCell className="font-medium">{autoCare.autoCareCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {autoCare.metricConfig?.map((config, index) => (
                          <Card key={`config-${index}`} className="mb-2 p-4">
                            <Label className="text-sm font-medium">
                              {constants.AUTOCARE_METRICS_DISPLAY[config.metric as keyof typeof constants.AUTOCARE_METRICS_DISPLAY]} : {config.value}
                            </Label>
                            <div className="text-xs text-gray-500">{`Next Service in : ${calNextValue(config, autoCare.currentMileage, autoCare.createdAt!)}`}</div>
                          </Card>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusEnumColor(autoCare.status!)}>
                        {getStatusEnumValue(autoCare.status!)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${autoCare.customerID}`}>
                        <Pen className="h-4 w-4 hover:text-blue-500" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
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

export default AutoCareBase;
