import { OptionType, SearchableSelect } from "@/components/select/SearchableSelect";
import { useMasterStore } from "@/hooks/use-master-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Customer } from "@/@types";
import { ServiceSearchFilters } from "./util";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";

interface SearchProps {
  onSearch: (filters: ServiceSearchFilters) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const { customers, fetchCustomers } = useMasterStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query params from URL
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  // Get customer IDs from query params
  const customerIdsFromQuery = queryParams.getAll('customerIds').map(id => Number(id));
  
  // Get vehicle license plate from query params
  const vehicleFromQuery = queryParams.get('vehicle') || '';
  
  // Create selected customer options from customer IDs
  const selectedCustomers = useMemo(() => {
    if (customerIdsFromQuery.length === 0) return [];
    
    return customers
      .filter((customer: Customer) => customerIdsFromQuery.includes(customer.customerID))
      .map((customer: Customer) => ({
        value: customer.customerID,
        label: `${customer.firstName} ${customer.lastName} (${customer.customerCode})`,
      }));
  }, [customers, customerIdsFromQuery]);

  // Convert customers to options for the select component
  const customerOptions = useMemo(() => {
    return customers.map((customer: Customer) => ({
      value: customer.customerID,
      label: `${customer.firstName} ${customer.lastName} (${customer.customerCode})`,
    }));
  }, [customers]);

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = async () => {
      await fetchCustomers();
    };
    loadCustomers();
  }, [fetchCustomers]);

  // Apply search filters from URL params when component loads
  useEffect(() => {
    if (location.search) {
      const filters: ServiceSearchFilters = {};
      
      if (customerIdsFromQuery.length > 0) {
        filters.customerIds = customerIdsFromQuery;
      }
      
      if (vehicleFromQuery) {
        filters.vehicleLicensePlate = vehicleFromQuery;
      }
      
      onSearch(filters);
    }
  }, []);

  // Update URL with filter parameters
  const updateUrlParams = (customerIds: number[], vehicle: string) => {
    const params = new URLSearchParams();
    
    // Add customer IDs if present
    if (customerIds && customerIds.length > 0) {
      customerIds.forEach(id => params.append('customerIds', id.toString()));
    }
    
    // Add vehicle license plate if present
    if (vehicle) {
      params.append('vehicle', vehicle);
    }
    
    // Update URL without triggering a page reload
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Handle search submission
  const handleSearch = () => {
    const customerIds = selectedCustomers.map(option => Number(option.value));
    const vehicleLicensePlate = vehicleFromQuery.trim();
    
    updateUrlParams(customerIds, vehicleLicensePlate);
    
    const filters: ServiceSearchFilters = {
      customerIds: customerIds.length > 0 ? customerIds : undefined,
      vehicleLicensePlate: vehicleLicensePlate || undefined,
    };
    
    onSearch(filters);
  };

  // Handle clearing filters
  const handleClear = () => {
    // Clear URL params
    navigate('', { replace: true });
    
    // Clear search filters
    onSearch({});
  };

  // Handle customer selection change
  const handleCustomerChange = (newValue: unknown) => {
    const newCustomers = newValue as OptionType[];
    const customerIds = newCustomers.map(option => Number(option.value));
    
    updateUrlParams(customerIds, vehicleFromQuery);
  };

  // Handle vehicle license plate change
  const handleVehicleChange = (value: string) => {
    const customerIds = selectedCustomers.map(option => Number(option.value));
    
    updateUrlParams(customerIds, value);
  };

  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 items-end">
      <div className="w-full sm:w-64">
        <Label htmlFor="customer-select" className="mb-1 block text-sm">
          Customers
        </Label>
        <SearchableSelect
          id="customer-select"
          options={customerOptions}
          value={selectedCustomers}
          onChange={handleCustomerChange}
          isMulti={true}
          placeholder="Select customers..."
          isLoading={customers.length === 0}
          isDisabled={customers.length === 0}
          noOptionsMessage={() => "No customers found"}
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Label htmlFor="vehicle-plate" className="mb-1 block text-sm">
          Vehicle
        </Label>
        <Input
          id="vehicle-plate"
          type="text"
          placeholder="Vehicle license plate"
          value={vehicleFromQuery}
          onChange={(e) => handleVehicleChange(e.target.value)}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleSearch}
          className="flex items-center"
          type="button"
        >
          <SearchIcon size={16} className="mr-1" />
          Search
        </Button>
        
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex items-center"
          type="button"
        >
          <X size={16} className="mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}