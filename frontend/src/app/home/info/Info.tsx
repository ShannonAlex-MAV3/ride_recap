import InfoTotalCards from "./InfoTotalCards";
import LatestRepairsTable from "./LatestRepairsTable";
import JobTrendPiePanel from "./MostPopularJobsPie";
// import UpcomingMaintenanceTable from "./UpcomingMaintainanceTable";

const InfoBase = () => {
  return (
    <>
      <div className="flex gap-4 p-4">
        {/* Left side: Main content (cards + table) */}
        <div className="flex-1 space-y-4">
          <InfoTotalCards />
          {/* <UpcomingMaintenanceTable /> */}
          <LatestRepairsTable />
        </div>

        {/* Right side: Single right panel */}
        <div className="w-1/4">
          {/* <div className="bg-gray-100 p-4 rounded shadow h-full"> */}
          <div className="flex-1 space-y-4">
            {/* <h2 className="text-lg font-semibold">Right Panel</h2> */}
            {/* Right panel content goes here */}
            <JobTrendPiePanel />
            <JobTrendPiePanel />
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoBase;
