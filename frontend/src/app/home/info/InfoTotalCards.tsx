import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon, CarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import {
  TotalCustomerDSB,
  TotalVehicleDSB,
  fetchTotalCustomersForDSB,
  fetchTotalVehiclesForDSB,
} from "./Util";

const InfoTotalCards = () => {
  const [totalCustomer, setTotalCustomer] = useState<TotalCustomerDSB | null>(
    null
  );
  const [totalVehicle, setTotalVehicle] = useState<TotalVehicleDSB | null>(
    null
  );

  useEffect(() => {
    const loadTotalCustomers = async () => {
      const res = await fetchTotalCustomersForDSB();
      setTotalCustomer(res);
    };

    loadTotalCustomers();
  }, []);

  useEffect(() => {
    const loadTotalVehicle = async () => {
      const res = await fetchTotalVehiclesForDSB();
      setTotalVehicle(res);
    };

    loadTotalVehicle();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Customers */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <h2 className="text-2xl font-bold">
              {totalCustomer ? totalCustomer.totalCustomers : 0}
            </h2>
            <p className="text-sm text-green-600 mt-1">
              {totalCustomer ? totalCustomer.totalCustomersForCurrentMonth : 0}{" "}
              New Customers
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <UsersIcon className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Total Vehicles */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Vehicles</p>
            <h2 className="text-2xl font-bold">
              {totalVehicle ? totalVehicle.totalVehicles : 0}
            </h2>
            <p className="text-sm text-green-600 mt-1">
              {totalVehicle ? totalVehicle.totalVehiclesForCurrentMonth : 0} New
              Vehicles
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <CarIcon className="w-5 h-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoTotalCards;
