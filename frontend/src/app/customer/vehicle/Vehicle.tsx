import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getStatusEnumColor, getStatusEnumValue } from "@/app/common/Utils";
import { Badge } from "@/components/ui/badge";
import { Pen } from "lucide-react";
import { Vehicle } from "@/@types";

type VehicleBaseProps = {
  vehicles: Vehicle[];
  onEditVehicle: (index: number) => void;
};

const VehicleBase = ({ vehicles, onEditVehicle }: VehicleBaseProps) => (
  <div className="mt-4">
    <Table>
      <TableCaption>List of Added Vehicles</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>License Plate</TableHead>
          <TableHead>Make</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Color</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle, index) => (
            <TableRow key={index}>
              <TableCell>{vehicle.licensePlate}</TableCell>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.color}</TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusEnumColor(vehicle.status)}>
                  {getStatusEnumValue(vehicle.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Pen
                  onClick={() => onEditVehicle(index)}
                  className="h-4 w-4 hover:text-blue-500"
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No vehicles added yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default VehicleBase;
