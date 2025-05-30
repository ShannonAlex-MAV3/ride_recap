import { Service } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatusEnumColor, getStatusEnumValue } from "../common/Utils";
import { fetchServices } from "./util";

const ServiceBase = () => {
  const [services, setServices] = useState<Service[]>([]);

  const getServices = useCallback(async () => {
    const response = await fetchServices();
    setServices(response);
  }, []);

  useEffect(() => {
    getServices();
  }, [getServices]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Service</h1>
        {services.length > 0 && (
          <Button className="ml-4">
            <Link to={`new`}>Add</Link>
          </Button>
        )}
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div>
          <Table>
            <TableCaption>A list of Services.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Service Code</TableHead>
                <TableHead className="w-[30%]">Jobs</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.serviceID} className="cursor-pointer hover:bg-gray-100">
                    <TableCell className="font-medium">{service.serviceCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {/* TODO */}
                        {/* {service.metricConfig?.map((config, index) => (
                          <Card key={`config-${index}`} className="mb-2 p-4">
                            <Label className="text-sm font-medium">
                              {constants.service_METRICS_DISPLAY[config.metric as keyof typeof constants.services_METRICS_DISPLAY]} : {config.value}
                            </Label>
                            <div className="text-xs text-gray-500">{`Next Service in : ${calNextValue(config, service.currentMileage, service.createdAt!)}`}</div>
                          </Card>
                        ))} */}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusEnumColor(service.status!)}>
                        {getStatusEnumValue(service.status!)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${service.customerID}`}>
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

export default ServiceBase;
