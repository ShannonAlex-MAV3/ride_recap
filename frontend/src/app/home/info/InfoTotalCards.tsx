import { Card, CardContent } from "@/components/ui/card";
import { UsersIcon, CarIcon } from "lucide-react";

const InfoTotalCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Customers */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <h2 className="text-2xl font-bold">1,200</h2>
            <p className="text-sm text-green-600 mt-1">
              +15.4% from last month
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
            <h2 className="text-2xl font-bold">2,800</h2>
            <p className="text-sm text-green-600 mt-1">
              +12.7% from last month
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
