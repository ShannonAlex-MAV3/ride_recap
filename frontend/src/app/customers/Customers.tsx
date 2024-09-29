import { Button } from "@/components/ui/button";
import { Outdent } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

const Customers = () => {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Customers</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no Customers
          </h3>
          <p className="text-sm text-muted-foreground">
            You can start viewing as soon as you ad a Customer.
          </p>
          <Link to={"add"}><Button className="mt-4">Add a Customer</Button></Link>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Customers;
