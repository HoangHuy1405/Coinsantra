import React from "react";
import { TotalAssetCard } from "./_components/PortfolioTable/TotalAssetCard";
import PortfolioAssetTable from "./_components/PortfolioTable/PortfolioAssetTable";
import ProfitLostAnalysis from "./_components/ProfitLostAnalysis";
import AITradeStatus from "./_components/AITradeStatus";
import PortfolioAllocationChart from "./_components/PortfolioAllocationChart";
import MarketTable from "@/app/ui/my_components/market-table/MarketTable";
import { getCachedMarketData } from "@/lib/actions/gecko.actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import { redirect } from "next/navigation";
import { ManualTransactionsTable } from "../history/_components/ManualTransactionsTable";
import { historyService } from "@/services/historyService";
import Link from "next/link";
import { Button } from "@/app/ui/shadcn/button";
import { Card } from "@/app/ui/shadcn/card";
import { ArrowRight } from "lucide-react";
import { getBotSubOverviewSSR } from "@/services/botSubService";

export default async function page() {
  const initialCoins = await getCachedMarketData(1000);
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login");
  }
  const historyFilter = { page: 0, size: 5, sort: "createdAt,desc" };
  const recentHistory = await historyService.getManualTransactions(
    historyFilter,
    session.accessToken,
  );

  // Fetch bot subscription overview
  const botOverview = await getBotSubOverviewSSR(session.accessToken);

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
        <MarketTable
          initialData={initialCoins}
          defaultPageSize={5}
          // symbols={SYMBOLS}
          // showLimit={6}
          // enableActions={true}
          // enablePagination={false}
          // enableSearch={false}
          // enableSorting={false}
        />
      </div>
      <div className="col-span-1 md:col-span-4 w-full">
        <AITradeStatus data={botOverview} />
      </div>

      {/* Row 5: Activity History */}
      <Card className="shadow-sm col-span-1 md:col-span-12 w-full p-6">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Link href="/my/wallet/history">
            <Button variant="outline">
              View More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ManualTransactionsTable
          data={recentHistory}
          currentPage={historyFilter.page}
          pageSize={historyFilter.size}
          showPagination={false}
        />
      </Card>
    </div>
  );
}
