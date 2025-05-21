import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMasterStore } from "@/hooks/use-master-store";
import { Pen } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getStatusEnumColor, getStatusEnumValue } from "../common/Utils";

const CustomerBase = () => {
  const { customers, fetchCustomers, isLoadingCustomers, customersError } = useMasterStore();

  useEffect(() => {
    // Fetch customers if not already loaded
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, [customers.length, fetchCustomers]);

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Customer Configuration
        </h1>
        <Button className="ml-4">
          <Link to={`new`}>Add</Link>
        </Button>
      </div>
      <div className="flex-grow p-4 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div>
          <Table>
            <TableCaption>A list of Customers.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Code</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Phone No:</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow
                    key={customer.customerID}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell className="font-medium">
                      {customer.customerCode}
                    </TableCell>
                    <TableCell>{customer.firstName}</TableCell>
                    <TableCell>{customer.lastName}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusEnumColor(customer.status)}>
                        {getStatusEnumValue(customer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`${customer.customerID}`}>
                        <Pen className="h-4 w-4 hover:text-blue-500" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : isLoadingCustomers ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {customersError ? `Error: ${customersError}` : 'No customers found'}
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

export default CustomerBase;
