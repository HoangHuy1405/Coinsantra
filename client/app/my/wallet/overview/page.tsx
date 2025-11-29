import React from "react";
import { TotalAssetCard } from "./_components/PortfolioTable/TotalAssetCard";
import PortfolioAssetTable from "./_components/PortfolioTable/PortfolioAssetTable";
import ProfitLostAnalysis from "./_components/ProfitLostAnalysis";
import AITradeStatus from "./_components/AITradeStatus";
import PortfolioAllocationChart from "./_components/PortfolioAllocationChart";
import ActivityHistoryTable from "@/app/ui/my_components/activity-history-table/ActivityHistoryTable";
import { mockActivities } from "@/entities/mockActivities";
import MarketTable from "@/app/ui/my_components/market-table/MarketTable";
import { getCachedMarketData } from "@/lib/actions/gecko.actions";

export default async function page() {
  const initialCoins = await getCachedMarketData(1000);
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      {/* Row 1: Total Assets */}
      <div className="col-span-1 md:col-span-12 w-full">
        <TotalAssetCard />
      </div>

      {/* Row 2: Portfolio Assets + Allocation */}
      <div className="col-span-1 md:col-span-8 w-full">
        <PortfolioAssetTable />
      </div>
      <div className="col-span-1 md:col-span-4 w-full">
        <PortfolioAllocationChart />
      </div>

      {/* Row 3: Profit/Loss Analysis */}
      <div className="col-span-1 md:col-span-12 w-full">
        <ProfitLostAnalysis />
      </div>

      {/* Row 4: Market + AI Trade Status */}
      <div className="col-span-1 md:col-span-8 w-full">
        <MarketTable initialData={initialCoins}
        // symbols={SYMBOLS}
        // showLimit={6}
        // enableActions={true}
        // enablePagination={false}
        // enableSearch={false}
        // enableSorting={false}
        />
      </div>
      <div className="col-span-1 md:col-span-4 w-full">
        <AITradeStatus />
      </div>

      {/* Row 5: Activity History */}
      <div className="col-span-1 md:col-span-12 w-full">
        <ActivityHistoryTable
          data={mockActivities}
          variant="overview"
          title="Latest Activity"
          subtitle="Your most recent trading activities"
        />
      </div>
    </div>
  );
}
