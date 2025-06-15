import { ServiceWithDetails } from "@/@types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatusEnumColor, getStatusEnumValue } from "../common/Utils";
import { ServiceSearchFilters, fetchServices } from "./util";
import Search from "./Search";

const ServiceBase = () => {
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getServices = useCallback(async (filters?: ServiceSearchFilters) => {
    setIsLoading(true);
    try {
      const response = await fetchServices(filters);
      setServices(response);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getServices();
  }, [getServices]);

  return (
    <>
      {" "}
      <div className="flex space-y-4 justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Service</h1>
            <Button className="ml-4">
              <Link to={`new`}>Add</Link>
            </Button>
          </div>
        </div>
        <Search onSearch={getServices} />
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div>
          <Table>
            <TableCaption>A list of Services.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">Service Code</TableHead>
                <TableHead className="w-[30%]">Customer</TableHead>
                <TableHead className="w-[20%]">Vehicle</TableHead>
                <TableHead className="w-[20%] text-center">Service Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {" "}
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <TableRow key={service.serviceID} className="cursor-pointer hover:bg-gray-100">
                    <TableCell className="font-medium">{service.serviceCode}</TableCell>
                    <TableCell>{`${service.firstName} ${service.lastName}`}</TableCell>
                    <TableCell>{`${service.licensePlate} (${service.make} ${service.model})`}</TableCell>
                    <TableCell className="text-center">
                      {new Date(service.serviceDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusEnumColor(service.status!)}>{getStatusEnumValue(service.status!)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${service.serviceID}`}>
                        <Eye className="h-4 w-4 hover:text-blue-500" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No services found
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
