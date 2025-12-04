"use client";

import React from "react";
import { Card, CardContent } from "@/app/ui/shadcn/card";
import PnLLineChart from "@/app/ui/my_components/charts/PnLLineChart";
import MetricBox from "@/app/ui/my_components/MetricBox";
import { Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export default function ProfitLostAnalysis() {
  const { data: assetData, isLoading } = useWallet();

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm border border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!assetData) {
    return null;
  }

  // Format chart data for PnLLineChart
  const chartData = assetData.pnlChartData.map((point) => ({
    timestamp: point.timestamp,
    pnl: point.value,
  }));

  return (
    <Card className="w-full shadow-sm border border-border bg-card">
      <CardContent className="pt-6">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-4">Profit / Loss Analysis</h3>

        {/* Chart */}
        <div className="mb-6">
          <PnLLineChart chartData={chartData} timeframe="7d" height="300px" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricBox
            label="Total Equity"
            value={`$${assetData.totalEquity.toFixed(2)}`}
            showTrend={false}
          />
          <MetricBox
            label="Net Investment"
            value={`$${assetData.netInvestment.toFixed(2)}`}
            showTrend={false}
          />
          <MetricBox
            label="PnL (30 Days)"
            value={`${assetData.pnl >= 0 ? "+" : ""}$${assetData.pnl.toFixed(2)}`}
            showTrend={true}
          />
          <MetricBox
            label="ROI (30 Days)"
            value={`${assetData.roi >= 0 ? "+" : ""}${assetData.roi.toFixed(2)}%`}
            showTrend={true}
          />
        </div>

        {/* Max Drawdown Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <MetricBox
            label="Max Drawdown"
            value={`$${assetData.maxDrawdown.toFixed(2)}`}
            showTrend={false}
          />
          <MetricBox
            label="Max Drawdown %"
            value={`${assetData.maxDrawdownPct.toFixed(2)}%`}
            showTrend={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
